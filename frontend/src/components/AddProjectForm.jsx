import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function AddProjectForm({ mentors, mentees, onProjectCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    description: '',
    deadline: '',
    githubRepo: '',
    mentorName: '',
    mentorEmail: '',
    teamMembers: []
  });
  const [availableMentees, setAvailableMentees] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch available mentees for team member selection
  useEffect(() => {
    const fetchAvailableMentees = async () => {
      try {
        console.log('Fetching available mentees...');

        const { data: menteesData, error: menteesError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'mentee');

        if (menteesError) {
          console.error('Error fetching available mentees:', menteesError);
          setMessage({ type: 'error', text: 'Failed to load available mentees. Please refresh the page.' });
        } else {
          setAvailableMentees(menteesData || []);
          console.log('Available mentees loaded:', menteesData?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching available mentees:', error);
        setMessage({ type: 'error', text: 'Failed to load available mentees. Please refresh the page.' });
      }
    };
    fetchAvailableMentees();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.trim()
    }));
  };

  const handleAddTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', email: '', role: 'Developer', userId: '' }]
    }));
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.teamMembers];

    if (field === 'email' && availableMentees.length > 0) {
      // Find the mentee by email and set userId
      const selectedMentee = availableMentees.find(mentee => mentee.email === value);
      if (selectedMentee) {
        updatedMembers[index] = {
          ...updatedMembers[index],
          email: value,
          userId: selectedMentee.id,
          name: selectedMentee.name
        };
      } else {
        updatedMembers[index] = {
          ...updatedMembers[index],
          email: value,
          userId: '',
          name: ''
        };
      }
    } else {
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value
      };
    }

    setFormData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };

  const handleRemoveTeamMember = (index) => {
    const updatedMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      teamMembers: updatedMembers
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.domain || !formData.githubRepo || !formData.mentorName || !formData.mentorEmail) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (Title, Domain, GitHub Repo, Mentor Name, Mentor Email)' });
      return;
    }

    // Validate email format for mentor
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mentorEmail.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid mentor email address' });
      return;
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;
    if (!githubUrlPattern.test(formData.githubRepo.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid GitHub repository URL (format: https://github.com/username/repository)' });
      return;
    }

    // Validate team members - if any team member has partial data, it's invalid
    for (const member of formData.teamMembers) {
      if (member.name || member.email || member.role) {
        if (!member.name || !member.email) {
          setMessage({ type: 'error', text: 'Team members must have both name and email filled in' });
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
          setMessage({ type: 'error', text: `Invalid email format for team member: ${member.email}` });
          return;
        }
      }
    }

    setMessage({ type: 'info', text: 'Creating project...' });

    try {
      // Get current user (in a real app, this would come from authentication)
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Validate mentor exists and is a mentor
      const { data: mentorData, error: mentorError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('email', formData.mentorEmail.trim().toLowerCase())
        .eq('role', 'mentor')
        .single();

      if (mentorError || !mentorData) {
        setMessage({ type: 'error', text: 'Invalid mentor email or mentor not found' });
        return;
      }

      // Validate team members exist in mentees table
      const validatedTeamMembers = [];
      if (formData.teamMembers.length > 0) {
        for (const member of formData.teamMembers) {
          if (member.email) {
            const { data: menteeData, error: menteeError } = await supabase
              .from('users')
              .select('id, name, email, role')
              .eq('id', member.userId)
              .eq('role', 'mentee')
              .single();

            if (menteeError || !menteeData) {
              setMessage({ type: 'error', text: `Team member not found: ${member.email}` });
              return;
            }

            validatedTeamMembers.push({
              userId: menteeData.id,
              name: menteeData.name,
              email: menteeData.email,
              role: member.role || 'Developer'
            });
          }
        }
      }

      // Create project in Supabase
      const projectData = {
        title: formData.title.trim(),
        domain: formData.domain.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        githubRepo: formData.githubRepo.trim(),
        mentorName: formData.mentorName.trim(),
        mentorEmail: formData.mentorEmail.trim().toLowerCase(),
        createdBy: currentUser.userId || null,
        status: 'draft',
        avgRating: 0,
        ratingsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select();

      if (insertError) {
        console.error('Supabase project insert error:', insertError);
        setMessage({ type: 'error', text: 'Server error while creating project' });
        return;
      }

      // Insert team members into project_team_members table
      if (validatedTeamMembers.length > 0) {
        const teamMemberInserts = validatedTeamMembers.map(member => ({
          project_id: project[0].id,
          user_id: member.userId,
          role: member.role,
          created_at: new Date().toISOString()
        }));

        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(teamMemberInserts);

        if (teamError) {
          console.error('Error inserting team members:', teamError);
          // Don't fail the project creation if team members fail, just log it
        }
      }

      console.log('Project created successfully:', project);

      setMessage({ type: 'success', text: 'Project created successfully!' });
      // Reset form after a short delay to show success message
      setTimeout(() => {
        setFormData({
          title: '',
          domain: '',
          description: '',
          deadline: '',
          githubRepo: '',
          mentorName: '',
          mentorEmail: '',
          teamMembers: []
        });
        if (onProjectCreated) {
          onProjectCreated();
        }
      }, 1500);

    } catch (error) {
      console.error('Error creating project:', error);
      setMessage({
        type: 'error',
        text: 'Failed to create project. Please try again.'
      });
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-500' : message.type === 'info' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Project Title - Required */}
        <div>
          <label className="block text-white mb-2">Project Title *</label>
          <input
            type="text"
            placeholder="Enter project title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Domain - Required */}
        <div>
          <label className="block text-white mb-2">Domain *</label>
          <select
            value={formData.domain}
            onChange={(e) => handleInputChange('domain', e.target.value)}
            className="w-full p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">Select Domain</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="IoT">Internet of Things</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="DevOps">DevOps</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Description - Optional */}
        <div>
          <label className="block text-white mb-2">Description</label>
          <textarea
            placeholder="Enter project description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none h-24 resize-none"
            rows={3}
          />
        </div>

        {/* Deadline - Optional */}
        <div>
          <label className="block text-white mb-2">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            className="w-full p-3 rounded-md bg-gray-600 text-white border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* GitHub Repo - Required */}
        <div className="bg-gray-600 p-4 rounded-lg border-2 border-orange-500">
          <label className="block text-white mb-2 font-bold text-lg">
            🔗 GitHub Repository *
            <span className="text-red-400 ml-1">(Required)</span>
          </label>
          <input
            type="url"
            placeholder="https://github.com/username/repository"
            value={formData.githubRepo}
            onChange={(e) => handleInputChange('githubRepo', e.target.value)}
            className="w-full p-3 rounded-md bg-gray-500 text-white border-2 border-gray-400 focus:border-orange-500 focus:outline-none text-lg"
            required
          />
          <p className="text-gray-300 text-sm mt-2">
            ⚠️ This field is mandatory. Please provide a valid GitHub repository URL.
          </p>
        </div>

        {/* Mentor Selection */}
        <div className="bg-gray-600 p-4 rounded-lg border-2 border-orange-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 font-bold text-lg">
                👨‍🏫 Mentor Name *
                <span className="text-red-400 ml-1">(Required)</span>
              </label>
              <input
                type="text"
                placeholder="Enter mentor name"
                value={formData.mentorName}
                onChange={(e) => handleInputChange('mentorName', e.target.value)}
                className="w-full p-3 rounded-md bg-gray-500 text-white border-2 border-gray-400 focus:border-orange-500 focus:outline-none text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-2 font-bold text-lg">
                📧 Mentor Email *
                <span className="text-red-400 ml-1">(Required)</span>
              </label>
              <input
                type="email"
                placeholder="mentor@example.com"
                value={formData.mentorEmail}
                onChange={(e) => handleInputChange('mentorEmail', e.target.value)}
                className="w-full p-3 rounded-md bg-gray-500 text-white border-2 border-gray-400 focus:border-orange-500 focus:outline-none text-lg"
                required
              />
            </div>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            ⚠️ Both mentor name and email are mandatory fields.
          </p>
        </div>

        {/* Team Members Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-white">Team Members</label>
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
            >
              + Add Team Member
            </button>
          </div>

          {formData.teamMembers.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No team members added yet</p>
          ) : (
            <div className="space-y-3">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="bg-gray-600 p-3 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-white mb-1 text-sm">Team Member</label>
                      <select
                        value={member.email || ''}
                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                        className="w-full p-2 rounded bg-gray-500 text-white border border-gray-400 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Mentee</option>
                        {availableMentees.map(mentee => (
                          <option key={mentee.id} value={mentee.email}>
                            {mentee.name} - {mentee.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-1 text-sm">Role</label>
                      <select
                        value={member.role}
                        onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                        className="w-full p-2 rounded bg-gray-500 text-white border border-gray-400 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Leader">Leader</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="Tester">Tester</option>
                        <option value="Analyst">Analyst</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(index)}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition duration-200"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProjectForm;
