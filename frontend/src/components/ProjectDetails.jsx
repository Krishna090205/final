import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
    {children}
  </span>
);

const Star = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" className={filled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}>
    <path stroke="currentColor" strokeWidth="1.5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const StarRow = ({ value = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(n => <Star key={n} filled={n <= Math.round(value)} />)}
  </div>
);

const Avatars = ({ members = [] }) => (
  <div className="flex -space-x-2">
    {members.slice(0, 5).map((m, i) => (
      <div key={i} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-white text-sm ring-2 ring-white" title={`${m.name}${m.role ? ' - ' + m.role : ''}`}>
        {(m.name || '?').substring(0,1).toUpperCase()}
      </div>
    ))}
    {members.length > 5 && (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm ring-2 ring-white">
        +{members.length - 5}
      </div>
    )}
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchProject = async () => {
    try {
      setLoading(true);
      // Try details endpoint first (Mongoose routes)
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}/detail`);
        setProject(res.data?.data || null);
        setErr('');
        return;
      } catch (err1) {
        // Fallback: fetch all projects and find by id (works with server.js that lacks details route)
        try {
          const list = await axios.get('http://localhost:5000/api/projects');
          const all = list.data?.data || list.data?.projects || [];
          const found = all.find(p => String(p._id) === String(id));
          if (found) {
            setProject(found);
            setErr('');
            return;
          }
          throw new Error('Project not found in list');
        } catch (err2) {
          console.error('Details fetch failed, list fallback also failed:', err1, err2);
          setErr('Failed to load project');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-32 w-full rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />))}
        </div>
      </div>
    </div>
  );
  if (err) return <div className="max-w-6xl mx-auto p-6 text-red-600">{err}</div>;
  if (!project) return <div className="max-w-6xl mx-auto p-6">Project not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title || project.projectName}</h1>
              <div className="mt-2 flex items-center gap-3">
                {project.domain && <Badge>{project.domain}</Badge>}
                {project.deadline && (
                  <span className="text-indigo-100 text-sm">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <StarRow value={project.avgRating || 0} />
              <p className="text-xs text-indigo-100 mt-1">Avg {Number(project.avgRating || 0).toFixed(2)} ({project.ratingsCount || 0})</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Link to="/projects" className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20">Back to Projects</Link>
            <Link to={`/projects/${id}/review`} className="px-4 py-2 rounded-md bg-white text-indigo-700 hover:bg-indigo-50">Open Reviews</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</p>
          </motion.div>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Mentor</p>
            <p className="text-sm text-gray-900 mt-1">{project.mentorName || '—'} {project.mentorEmail && <span className="text-gray-500">({project.mentorEmail})</span>}</p>
          </motion.div>
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Team</p>
            <div className="mt-2"><Avatars members={project.teamMembers || []} /></div>
          </motion.div>
        </div>

        {/* Description & Team */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{project.description || 'No description provided.'}</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            {Array.isArray(project.teamMembers) && project.teamMembers.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {project.teamMembers.map((tm, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{tm.name || 'Member'}</span>
                    <span className="text-gray-500">{tm.role || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No team members listed.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetails;
