import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HODDashboard() {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5173/api/mentors-projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching mentor projects:", err));
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 p-4">
        <h3 className="text-lg font-bold mb-4">HOD Dashboard</h3>
        <ul>
          {mentors.map(mentor => (
            <li 
              key={mentor.id} 
              className="cursor-pointer p-2 mb-2 bg-gray-700 rounded-md hover:bg-gray-600"
              onClick={() => setSelectedMentor(mentor)}
            >
              {mentor.name}
            </li>
          ))}
        </ul>
        
        {/* Logout Button Moved to Sidebar */}
        <div className="mt-8">
          <button 
            onClick={handleLogout} 
            className="w-full py-2 px-4 bg-red-500 text-white rounded-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 ml-64">
        <div className="w-full max-w-3xl p-8 bg-white text-gray-900 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold mb-6">Mentors</h2>

          {/* Selected Mentor Details */}
          {selectedMentor ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">{selectedMentor.name}'s Projects</h3>
              <ul>
                {selectedMentor.projects.map((project, index) => (
                  <li key={index} className="mb-4 p-4 bg-gray-100 rounded-md">
                    <h4 className="font-semibold mb-2">{project.name}</h4>
                    <p>Members:</p>
                    <ul>
                      {project.members.map((member, i) => (
                        <li key={i} className="ml-4">{member}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Select a mentor to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HODDashboard;