import React, { useEffect, useState } from "react";
import axios from "axios";

const HodDashboard = () => {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mentorRes, menteeRes, projectRes] = await Promise.all([
        axios.get("http://localhost:5000/api/mentors"),
        axios.get("http://localhost:5000/api/mentees"),
        axios.get("http://localhost:5000/api/hod/project-details"),
      ]);

      setMentors(mentorRes.data.data);
      setMentees(menteeRes.data.data);
      setProjects(projectRes.data.data);
    } catch (err) {
      alert("Error loading data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    alert("Logged out successfully!");
    window.location.href = "/"; // Redirect to login or home
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">HOD Dashboard</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mentors */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Mentors</h2>
          <ul className="space-y-1">
            {mentors.map((m) => (
              <li key={m._id} className="text-gray-800">
                {m.name} ({m.email})
              </li>
            ))}
          </ul>
        </div>

        {/* Mentees */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Mentees</h2>
          <ul className="space-y-1">
            {mentees.map((m) => (
              <li key={m._id} className="text-gray-800">
                {m.name} ({m.email})
              </li>
            ))}
          </ul>
        </div>

        {/* Projects */}
        <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-3">
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Project Name</th>
                  <th className="p-2 border">Mentor</th>
                  <th className="p-2 border">Mentee</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 border">{p.projectName}</td>
                    <td className="p-2 border">
                      {p.mentor?.name} ({p.mentor?.email})
                    </td>
                    <td className="p-2 border">
                      {p.mentee?.name} ({p.mentee?.email})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
