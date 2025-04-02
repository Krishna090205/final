import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddProjectForm from './AddProjectForm';

function ProjectCoordinatorDashboard() {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentee, setSelectedMentee] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentors')
      .then(response => setMentors(response.data.data))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load mentors' }));

    axios.get('http://localhost:5000/api/mentees')
      .then(response => setMentees(response.data.data))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load mentees' }));
    
    axios.get('http://localhost:5000/api/projects')
      .then(response => setProjects(response.data.data))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load projects' }));
  }, []);

  const handleMentorAssignment = () => {
    if (!selectedMentor || !selectedMentee) {
      setMessage({ type: 'error', text: 'Please select both a mentor and a mentee' });
      return;
    }
    axios.post('http://localhost:5000/api/assign-mentor', {
      mentorEmail: selectedMentor,
      menteeEmail: selectedMentee
    })
      .then(() => setMessage({ type: 'success', text: 'Mentor assigned successfully' }))
      .catch(() => setMessage({ type: 'error', text: 'Failed to assign mentor' }));
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-3xl p-6 bg-gray-800 text-gray-200 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Project Coordinator Dashboard</h2>
        <button onClick={handleLogout} className="mb-4 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md">Logout</button>

        {message.text && (
          <div className={`mb-4 p-2 text-center rounded-md ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {message.text}
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-semibold mb-4 text-lg">Add New Project</h3>
          <AddProjectForm mentors={mentors} />
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-4 text-lg">Assign Mentor to Mentee</h3>
          <select 
            value={selectedMentor} 
            onChange={e => setSelectedMentor(e.target.value)} 
            className="w-full p-2 border rounded-md bg-gray-700 text-white"
          >
            <option value="">Select a Mentor</option>
            {mentors.map(mentor => (
              <option key={mentor.email} value={mentor.email}>{mentor.email}</option>
            ))}
          </select>

          <select 
            value={selectedMentee} 
            onChange={e => setSelectedMentee(e.target.value)} 
            className="w-full p-2 border rounded-md bg-gray-700 text-white mt-2"
          >
            <option value="">Select a Mentee</option>
            {mentees.map(mentee => (
              <option key={mentee.email} value={mentee.email}>{mentee.email}</option>
            ))}
          </select>

          <button 
            onClick={handleMentorAssignment} 
            className="mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Assign Mentor
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCoordinatorDashboard;
