import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MenteeDashboard() {
  const [activeSections, setActiveSections] = useState(['ideaPresentation']);
  const [uploads, setUploads] = useState({});
  const [selectedSection, setSelectedSection] = useState('ideaPresentation');
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

  const sections = {
    "ideaPresentation": { label: "Idea Presentation", allowedTypes: ["ppt", "pptx"], required: [] },
    "progress1": { label: "Progress 1", allowedTypes: ["ppt", "pdf"], required: ["ideaPresentation"] },
    "progress2": { label: "Progress 2", allowedTypes: ["ppt", "pdf"], required: ["progress1"] },
    "phase1": { label: "Phase 1 Report", allowedTypes: ["pdf"], required: ["progress1", "progress2"] },
    "progress3": { label: "Progress 3", allowedTypes: ["ppt", "pdf"], required: ["phase1"] },
    "progress4": { label: "Progress 4", allowedTypes: ["ppt", "pdf"], required: ["progress3"] },
    "finalReport": { label: "Final Report", allowedTypes: ["pdf"], required: ["progress3", "progress4"] },
    "finalDemo": { label: "Final Demo", allowedTypes: ["mp4", "mkv"], required: ["finalReport"] },
    "finalPpt": { label: "Final PPT", allowedTypes: ["ppt", "pptx"], required: ["finalDemo"] },
  };

  useEffect(() => {
    const storedUploads = JSON.parse(localStorage.getItem('uploads')) || {};
    setUploads(storedUploads);

    const storedGroupName = localStorage.getItem('groupName') || '';
    setGroupName(storedGroupName);

    const unlockedSections = Object.keys(sections).filter((key) =>
      sections[key].required.every((req) => storedUploads[req])
    );

    setActiveSections(unlockedSections);
  }, []);

  const handleSectionClick = (section) => {
    if (activeSections.includes(section)) {
      setSelectedSection(section);
    } else {
      alert(`${sections[section].label} is not accessible yet.`);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = sections[selectedSection].allowedTypes;
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      alert(`Invalid file type! Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Convert File to URL for storage (Mentor will use this URL)
    const fileURL = URL.createObjectURL(file);

    const newUploads = {
      ...uploads,
      [selectedSection]: {
        fileURL, // Store only the file URL
        filename: file.name,
        timestamp: new Date().toLocaleString(),
        remark: "Pending Review",
      },
    };

    setUploads(newUploads);
    localStorage.setItem('uploads', JSON.stringify(newUploads));

    const unlockedSections = Object.keys(sections).filter((key) =>
      sections[key].required.every((req) => newUploads[req])
    );

    setActiveSections(unlockedSections);
    alert(`${sections[selectedSection].label} uploaded successfully.`);
  };

  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 p-4">
        <h2 className="text-xl font-bold text-center mb-5">Mentee Dashboard</h2>
        {groupName && <p className="text-center text-gray-300">Group: <span className="font-semibold">{groupName}</span></p>}
        <div className="space-y-4 mt-4">
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              onClick={() => handleSectionClick(key)}
              className={`w-full py-2 px-4 text-left rounded transition-all ${
                selectedSection === key ? 'bg-blue-600' : 'bg-gray-700'
              } ${activeSections.includes(key) ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              {sections[key].label}
            </button>
          ))}
          <button onClick={() => navigate('/login')} className="w-full py-2 px-4 bg-red-500 rounded">Logout</button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="w-3/4 p-4 bg-white text-gray-900">
        <p>Allowed File Types: {sections[selectedSection]?.allowedTypes.join(', ')}</p>
        <input
          type="file"
          accept={sections[selectedSection]?.allowedTypes.map((ext) => `.${ext}`).join(', ')}
          onChange={handleFileUpload}
          className="w-full p-2 border rounded mt-2"
        />
      </div>
    </div>
  );
}

export default MenteeDashboard;
