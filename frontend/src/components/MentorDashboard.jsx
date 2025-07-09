import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  

  useEffect(() => {
    const storedUploads = JSON.parse(localStorage.getItem('uploads')) || {};
    setUploads(storedUploads);
  }, []);

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
              className={`w-full py-2 px-3 rounded text-left transition-all duration-200 ${
                selectedSection === key ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {sections[key]}
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-6 py-2 px-3 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-white text-gray-900 overflow-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Uploaded Files Overview</h3>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border border-gray-300 px-4 py-2">Section</th>
              <th className="border border-gray-300 px-4 py-2">Filename</th>
              <th className="border border-gray-300 px-4 py-2">Remark</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sections).map((section, idx) => {
              const upload = uploads[section];
              return (
                <tr key={idx} className="text-center border border-gray-200">
                  <td className="border px-4 py-3 font-medium">{sections[section]}</td>
                  <td className="border px-4 py-3">{upload ? upload.filename : '-'}</td>
                  <td className="border px-4 py-3">
                    {upload ? upload.remark || 'No remarks yet' : '-'}
                  </td>
                  <td className="px-4 py-3 border">
                    {upload ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFileView(section)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(section)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Download
                          </button>
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <input
                            type="text"
                            placeholder="Enter remark"
                            className="border border-gray-400 rounded px-2 py-1 w-48 text-sm text-gray-900"
                            value={remarks[section] || ""}
                            onChange={(e) => handleRemarkChange(section, e)}
                          />
                          <button
                            onClick={() => submitRemark(section)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            Submit
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
            <div className="bg-white p-4 rounded-lg w-4/5 h-4/5 relative shadow-lg">
              <button
                onClick={closeFileView}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Close
              </button>
              <iframe
                src={viewFile}
                className="w-full h-full rounded"
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
