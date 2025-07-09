import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MenteeDashboard() {
  const [uploads, setUploads] = useState({});
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

  const sections = {
    "ideaPresentation": { label: "Idea Presentation", allowedTypes: ["pdf"], required: [] },
    "progress1": { label: "Progress 1", allowedTypes: ["ppt", "pdf"], required: ["ideaPresentation"] },
    "progress2": { label: "Progress 2", allowedTypes: ["ppt", "pdf"], required: ["progress1"] },
    "phase1": { label: "Phase 1 Report", allowedTypes: ["pdf"], required: ["progress1", "progress2"] },
    "progress3": { label: "Progress 3", allowedTypes: ["ppt", "pdf"], required: ["phase1"] },
    "progress4": { label: "Progress 4", allowedTypes: ["ppt", "pdf"], required: ["progress3"] },
    "finalReport": { label: "Final Report", allowedTypes: ["pdf"], required: ["progress3", "progress4"] },
    "finalDemo": { label: "Final Demo", allowedTypes: ["mp4", "mkv"], required: ["finalReport"] },
    "finalPpt": { label: "Final PPT", allowedTypes: ["pdf"], required: ["finalDemo"] },
    "codebook": { label: "Codebook", allowedTypes: ["docs","pdf"], required: ["finalPpt"] },
    "achievements": { label: "Achievements", allowedTypes: ["pdf","txt","docs"], required: ["codebook"] },
  };

  useEffect(() => {
    const storedUploads = JSON.parse(localStorage.getItem('uploads')) || {};
    const storedGroupName = localStorage.getItem('groupName') || '';
    setUploads(storedUploads);
    setGroupName(storedGroupName);
  }, []);

  const isSectionActive = (section) =>
    sections[section].required.every(req => uploads[req]);

  const handleFileChange = (e, section) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowed = sections[section].allowedTypes;

    if (!allowed.includes(fileExtension)) {
      alert(`Allowed file types: ${allowed.join(', ')}`);
      return;
    }

    const fileURL = URL.createObjectURL(file);
    const newUploads = {
      ...uploads,
      [section]: {
        fileURL,
        filename: file.name,
        timestamp: new Date().toLocaleString(),
        remark: "Pending Review",
      },
    };

    setUploads(newUploads);
    localStorage.setItem('uploads', JSON.stringify(newUploads));
    alert(`${sections[section].label} uploaded successfully.`);
  };

  const handleDeleteFile = (section) => {
    const newUploads = { ...uploads };
    delete newUploads[section];
    setUploads(newUploads);
    localStorage.setItem('uploads', JSON.stringify(newUploads));
    alert(`${sections[section].label} file deleted.`);
  };

  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      <div className="w-1/4 bg-gray-900 p-4">
        <h2 className="text-xl font-bold text-center mb-5">Mentee Dashboard</h2>
        <button onClick={() => navigate('/login')} className="w-full mt-5 py-2 px-4 bg-red-500 rounded">
          Logout
        </button>
      </div>

      <div className="w-3/4 p-4 bg-white text-gray-900">
        <table className="w-full border border-gray-300 text-center">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Section</th>
              <th className="border px-4 py-2">Upload</th>
              <th className="border px-4 py-2">Remark</th>
              <th className="border px-4 py-2">Uploaded File</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sections).map((section, index) => (
              <tr key={index} className={`${!isSectionActive(section) && 'opacity-50'}`}>
                <td className="border px-4 py-2 font-semibold">{sections[section].label}</td>
                <td className="border px-4 py-2">
                  <input
                    type="file"
                    accept={sections[section].allowedTypes.map(ext => `.${ext}`).join(',')}
                    onChange={(e) => handleFileChange(e, section)}
                    disabled={!isSectionActive(section)}
                    className="text-sm"
                  />
                </td>
                <td className="border px-4 py-2">
                  {uploads[section]?.remark || "Pending"}
                </td>
                <td className="border px-4 py-2">
                  {uploads[section] ? (
                    <div className="flex flex-col items-center">
                      <p className="text-sm">{uploads[section].filename}</p>
                      <p className="text-xs text-gray-600">Uploaded on: {uploads[section].timestamp}</p>
                      <div className="mt-1 flex gap-2">
                        <a
                          href={uploads[section].fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteFile(section)}
                          className="text-red-600 text-sm underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No file uploaded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MenteeDashboard;
