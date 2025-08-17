import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaEye, FaUpload, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaTrash, FaDownload, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

function MentorDashboard() {
  const [uploads, setUploads] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [viewFile, setViewFile] = useState(null);
  const [remarks, setRemarks] = useState({});
  const navigate = useNavigate();

  const sections = {
    ideaPresentation: "Idea Presentation",
    progress1: "Progress 1",
    progress2: "Progress 2",
    phase1: "Phase 1 Report",
    progress3: "Progress 3",
    progress4: "Progress 4",
    finalReport: "Final Report",
    finalDemo: "Final Demo",
    finalPpt: "Final PPT",
    codebook: "Codebook",
    achievements: "Achievements",
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

  const handleFileView = (section) => {
    const fileURL = uploads[section]?.fileURL;
    if (fileURL) {
      setViewFile(fileURL);
    }
  };

  const closeFileView = () => {
    setViewFile(null);
  };

  const handleDownload = (section) => {
    const fileURL = uploads[section]?.fileURL;
    if (fileURL) {
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = uploads[section].filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleRemarkChange = (section, event) => {
    setRemarks({ ...remarks, [section]: event.target.value });
  };

  const submitRemark = (section) => {
    const updatedUploads = {
      ...uploads,
      [section]: { ...uploads[section], remark: remarks[section] || "No remarks" },
    };
    setUploads(updatedUploads);
    localStorage.setItem('uploads', JSON.stringify(updatedUploads));
    alert("Remark submitted successfully!");
  };

  const handleDeleteFile = (section, filename) => {
    const newUploads = { ...uploads };
    if (newUploads[section]) {
      delete newUploads[section][filename];
      if (Object.keys(newUploads[section]).length === 0) {
        delete newUploads[section];
      }
      setUploads(newUploads);
      localStorage.setItem('uploads', JSON.stringify(newUploads));
    }
  };

  useEffect(() => {
    const storedUploads = JSON.parse(localStorage.getItem('uploads')) || {};
    setUploads(storedUploads);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-900 p-5">
        <h2 className="text-xl font-bold text-center mb-6">Mentor Dashboard</h2>
        <div className="space-y-3">
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedSection(key)}
              className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
                selectedSection === key ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(uploads[key]?.remark)}
                <span>{sections[key]}</span>
              </div>
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-6 py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-white text-gray-900 overflow-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Uploaded Files Overview</h3>
        <table className="w-full border border-gray-300 text-sm rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border border-gray-300 px-6 py-3">Section</th>
              <th className="border border-gray-300 px-6 py-3">Filename</th>
              <th className="border border-gray-300 px-6 py-3">Status</th>
              <th className="border border-gray-300 px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sections).map((section, idx) => {
              const upload = uploads[section];
              return (
                <tr key={idx} className="text-center border border-gray-200">
                  <td className="border px-6 py-4 font-medium text-gray-900">{sections[section]}</td>
                  <td className="border px-6 py-4 text-gray-900">{upload ? upload.filename : '-'}</td>
                  <td className="border px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {getStatusIcon(upload?.remark)}
                      <select
                        value={upload?.remark || ''}
                        onChange={(e) => handleRemarkChange(section, e)}
                        className="border border-gray-400 rounded px-3 py-2 w-48 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Needs Improvement">Needs Improvement</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 border">
                    {upload ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleFileView(section)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <FaEye />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownload(section)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <FaDownload />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => submitRemark(section)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <FaSave />
                            <span>Save Remark</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFile(section, upload.filename)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* File View Modal */}
        {viewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-4/5 h-4/5 relative shadow-xl">
              <button
                onClick={closeFileView}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaTimes />
                <span>Close</span>
              </button>
              <iframe
                src={viewFile}
                className="w-full h-full rounded-lg"
                title="File Viewer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;
