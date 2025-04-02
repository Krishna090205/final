import axios from 'axios';
import React, { useState } from 'react';

function AddProjectForm({ mentors }) {
  const [projectName, setProjectName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    axios.post('http://localhost:5000/api/add-project', { projectName, mentorEmail })
      .then(response => {
        if (response.data.success) {
          alert('Project added successfully');
        } else {
          setError(response.data.message || 'Failed to add project');
        }
      })
      .catch((err) => setError('Error while adding project'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={projectName} 
        onChange={(e) => setProjectName(e.target.value)} 
        placeholder="Project Name" 
        required 
      />
      <select
        value={mentorEmail}
        onChange={(e) => setMentorEmail(e.target.value)}
        required
      >
        <option value="">Select Mentor</option>
        {mentors.map(mentor => (
          <option key={mentor.email} value={mentor.email}>
            {mentor.email}
          </option>
        ))}
      </select>
      <button type="submit">Add Project</button>

      {error && <p>{error}</p>}
    </form>
  );
}

export default AddProjectForm;