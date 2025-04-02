import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MentorDashboard() {
  const [uploads, setUploads] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [viewFile, setViewFile] = useState(null);
  const [remarks, setRemarks] = useState({});
  const navigate = useNavigate();

  const sections = {
    "ideaPresentation": "Idea Presentation",
    "progress1": "Progress 1",
    "progress2": "Progress 2",
    "phase1": "Phase 1 Report",
    "progress3": "Progress 3",
    "progress4": "Progress 4",
    "finalReport": "Final Report",
    "finalDemo": "Final Demo",
    "finalPpt": "Final PPT",
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
    <div className="flex min-h-screen bg-gray-800 text-white relative pb-25">
      <div className="w-1/4 bg-gray-900 p-4">
        <h2 className="text-xl font-bold text-center mb-5">Mentor Dashboard</h2>
        <div className="space-y-4">
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedSection(key)}
              className={`w-full py-3 px-4 text-left rounded transition-all duration-300 ${
                selectedSection === key ? 'bg-blue-600 text-white' : 'bg-gray-700'
              }`}
            >
              {sections[key]}
            </button>
          ))}
          <button onClick={() => navigate('/login')} className="w-full py-3 px-4 bg-red-500 text-white rounded">Logout</button>
        </div>
      </div>
      <div className="w-3/4 p-4 bg-white text-gray-900 relative">
        <table className="w-full border-collapse border-gray-400">
          <thead>
            <tr className="bg-gray-300 text-center">
              <th className="border border-gray-400 px-4 py-3">Filename</th>
              <th className="border border-gray-400 px-4 py-3">Remark</th>
              <th className="border border-gray-400 px-4 py-3">Operations</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sections).map((section, index) => (
              <tr key={index} className="border border-gray-400 text-center">
                <td className="border border-blue-400 px-4 py-4">
                  {uploads[section] ? uploads[section].filename : "-"}
                </td>
                <td className="border border-blue-400 px-4 py-4">
                  {uploads[section] ? uploads[section].remark || "No remarks yet" : "-"}
                </td>
                <td className="border border-blue-400 px-4 py-4">
                  {uploads[section] && (
                    <>
                      <button
                        onClick={() => handleFileView(section)}
                        className="py-1 px-4 bg-green-500 text-white rounded mr-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(section)}
                        className="py-1 px-4 bg-blue-500 text-white rounded mr-2"
                      >
                        Download
                      </button>
                      <input
                        type="text"
                        placeholder="Enter remark"
                        className="border rounded px-2 py-1 mr-2"
                        value={remarks[section] || ""}
                        onChange={(e) => handleRemarkChange(section, e)}
                      />
                      <button
                        onClick={() => submitRemark(section)}
                        className="py-1 px-4 bg-yellow-500 text-white rounded"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {viewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 relative">
              <button
                onClick={closeFileView}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
              <iframe
                src={viewFile}
                className="w-full h-full"
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