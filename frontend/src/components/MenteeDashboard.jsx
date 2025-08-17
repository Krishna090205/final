import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUpload, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaEye, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

function MenteeDashboard() {
  const [uploads, setUploads] = useState({});
  const [groupName, setGroupName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUploads = JSON.parse(localStorage.getItem('uploads')) || {};
    const storedGroupName = localStorage.getItem('groupName') || '';
    const storedDescription = localStorage.getItem('projectDescription') || '';
    setUploads(storedUploads);
    setGroupName(storedGroupName);
    setProjectDescription(storedDescription);
  }, []);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <FaCheckCircle className="text-green-500" />;
      case 'Needs Improvement':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'Rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaUpload className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-8">Mentee Dashboard</h1>
          <nav className="space-y-4">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full flex items-center justify-center py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Project Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Project Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  localStorage.setItem('groupName', e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => {
                  setProjectDescription(e.target.value);
                  localStorage.setItem('projectDescription', e.target.value);
                }}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project description..."
              />
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Project Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(sections).map(([key, section]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  uploads[key] && uploads[key].remark === 'Accepted'
                    ? 'border-green-500 bg-green-50'
                    : uploads[key] && uploads[key].remark === 'Needs Improvement'
                    ? 'border-yellow-500 bg-yellow-50'
                    : uploads[key] && uploads[key].remark === 'Rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{section.label}</h3>
                    <p className="text-sm text-gray-500">Allowed: {section.allowedTypes.join(', ')}</p>
                  </div>
                  {uploads[key] && (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploads[key].remark)}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept={section.allowedTypes.map(ext => `.${ext}`).join(',')}
                      onChange={(e) => handleFileChange(e, key)}
                      className="hidden"
                      id={`file-${key}`}
                    />
                    <label
                      htmlFor={`file-${key}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <FaUpload className="mr-2" />
                      Upload File
                    </label>
                  </div>
                  {uploads[key] && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{uploads[key].filename}</p>
                        <p className="text-xs text-gray-500">Uploaded: {uploads[key].timestamp}</p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => window.open(uploads[key].fileURL, '_blank')}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <FaEye className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteFile(key)}
                          className="flex items-center text-red-600 hover:text-red-700"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MenteeDashboard;
