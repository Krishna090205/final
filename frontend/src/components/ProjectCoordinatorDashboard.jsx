import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProjectCoordinatorDashboard() {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentee, setSelectedMentee] = useState('');
  const [selectedExistingProject, setSelectedExistingProject] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentors').then(res => setMentors(res.data.data));
    axios.get('http://localhost:5000/api/mentees').then(res => setMentees(res.data.data));
    axios.get('http://localhost:5000/api/projects').then(res => setProjects(res.data.data));
  }, []);

  const handleProjectSubmit = () => {
    if (!selectedExistingProject || !selectedMentor || !selectedMentee) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    // Optional: Keep or remove this check depending on your logic
    const alreadyAssigned = projects.some(
      p =>
        p.projectName === selectedExistingProject &&
        p.mentorEmail === selectedMentor &&
        p.menteeEmail === selectedMentee
    );

    if (alreadyAssigned) {
      setMessage({ type: 'error', text: 'This project is already assigned to the selected mentor and mentee.' });
      return;
    }

    axios.post('http://localhost:5000/api/add-project', {
      projectName: selectedExistingProject,
      mentorEmail: selectedMentor,
      menteeEmail: selectedMentee
    }).then(() => {
      setMessage({ type: 'success', text: 'Project assigned successfully' });
      setSelectedExistingProject('');
      setSelectedMentor('');
      setSelectedMentee('');
      axios.get('http://localhost:5000/api/projects').then(res => setProjects(res.data.data));
    }).catch(() => {
      setMessage({ type: 'error', text: 'Failed to assign project' });
    });
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">Coordinator Panel</h2>
        <button onClick={handleLogout} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold mb-4">Assign Project & Mentor</h1>

        {message.text && (
          <div className={`mb-4 p-2 rounded-md text-center ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {message.text}
          </div>
        )}

        {/* Project Name Input */}
        <input
          type="text"
          value={selectedExistingProject}
          onChange={e => setSelectedExistingProject(e.target.value)}
          placeholder="Enter Project Name"
          className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
        />

        {/* Mentor Dropdown */}
        <select
          value={selectedMentor}
          onChange={e => setSelectedMentor(e.target.value)}
          className="w-full p-2 mb-2 rounded-md bg-gray-700 text-white"
        >
          <option value="">Select Mentor</option>
          {mentors.map(m => (
            <option key={m.email} value={m.email}>{m.email}</option>
          ))}
        </select>

        {/* Mentee Dropdown */}
        <select
          value={selectedMentee}
          onChange={e => setSelectedMentee(e.target.value)}
          className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white"
        >
          <option value="">Select Mentee</option>
          {mentees.map(m => (
            <option key={m.email} value={m.email}>{m.email}</option>
          ))}
        </select>

        {/* Assign Button */}
        <button
          onClick={handleProjectSubmit}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Assign Project
        </button>

        <hr className="my-6 border-gray-600" />

        <h2 className="text-xl font-bold mb-2">All Projects</h2>
        <div className="bg-gray-700 rounded-md p-4 max-h-80 overflow-y-auto">
          {projects.length === 0 ? (
            <p>No projects available.</p>
          ) : (
            projects.map((p, index) => (
              <div key={index} className="mb-2 p-2 border-b border-gray-600">
                <strong>{p.projectName}</strong><br />
                Mentor: {p.mentorEmail} <br />
                Mentee: {p.menteeEmail}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectCoordinatorDashboard;
