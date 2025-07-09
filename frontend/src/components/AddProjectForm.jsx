import React, { useState } from 'react';
import axios from 'axios';

function AddProjectForm({ mentors, mentees }) {
  const [projectName, setProjectName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [menteeEmail, setMenteeEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddProject = () => {
    if (!projectName || !mentorEmail || !menteeEmail) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    axios.post('http://localhost:5000/api/add-project', {
      projectName,
      mentorEmail,
      menteeEmail
    })
      .then(res => {
        setMessage({ type: 'success', text: res.data.message });
        setProjectName('');
        setMentorEmail('');
        setMenteeEmail('');
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to add project' });
      });
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md">
      {message.text && (
        <div className={`mb-2 p-2 rounded ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {message.text}
        </div>
      )}
      <input 
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="w-full p-2 mb-2 rounded-md bg-gray-600 text-white"
      />

      <select 
        value={mentorEmail} 
        onChange={e => setMentorEmail(e.target.value)} 
        className="w-full p-2 mb-2 rounded-md bg-gray-600 text-white"
      >
        <option value="">Select Mentor</option>
        {mentors.map(mentor => (
          <option key={mentor.email} value={mentor.email}>{mentor.email}</option>
        ))}
      </select>

      <select 
        value={menteeEmail} 
        onChange={e => setMenteeEmail(e.target.value)} 
        className="w-full p-2 mb-2 rounded-md bg-gray-600 text-white"
      >
        <option value="">Select Mentee</option>
        {mentees.map(mentee => (
          <option key={mentee.email} value={mentee.email}>{mentee.email}</option>
        ))}
      </select>

      <button 
        onClick={handleAddProject}
        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Add Project
      </button>
    </div>
  );
}

export default AddProjectForm;
