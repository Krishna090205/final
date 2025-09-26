import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
    {children}
  </span>
);

const Avatars = ({ members = [] }) => (
  <div className="flex -space-x-2">
    {members.slice(0, 5).map((m, i) => (
      <div
        key={i}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-white text-xs ring-2 ring-white"
        title={`${m.name}${m.role ? ' - ' + m.role : ''}`}
      >
        {(m.name || '?').substring(0, 1).toUpperCase()}
      </div>
    ))}
    {members.length > 5 && (
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs ring-2 ring-white">
        +{members.length - 5}
      </div>
    )}
  </div>
);

const Toast = ({ toast, onClose }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-md shadow-lg border text-sm ${
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className="font-medium">{toast.type === 'error' ? 'Error' : 'Success'}</span>
          <span className="opacity-80">•</span>
          <span>{toast.message}</span>
          <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">✕</button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SkeletonCard = () => (
  <div className="bg-white border rounded-xl p-4 shadow-sm animate-pulse">
    <div className="h-5 w-2/3 bg-gray-200 rounded" />
    <div className="mt-3 h-4 w-1/3 bg-gray-200 rounded" />
    <div className="mt-4 h-16 w-full bg-gray-100 rounded" />
    <div className="mt-5 h-4 w-1/2 bg-gray-200 rounded" />
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    domain: '',
    description: '',
    deadline: '',
    mentorName: '',
    mentorEmail: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [teamMembers, setTeamMembers] = useState([{ name: '', role: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const coerceProjects = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.projects)) return payload.projects;
    if (payload.success && Array.isArray(payload.files)) return payload.files; // not expected, but guard
    return [];
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/projects');
        setProjects(coerceProjects(res.data));
        setError('');
        return;
      } catch (err1) {
        // Fallback to relative path in case of proxy/environment differences
        const res2 = await axios.get('/api/projects');
        setProjects(coerceProjects(res2.data));
        setError('');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load projects';
      setError(msg);
      console.error('Projects fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Debounced server-side search fallback when query is at least 2 chars
  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();
    if (q.length < 2) {
      // reload full list lightly without resetting loading state
      (async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/projects', { signal: controller.signal });
          setProjects(coerceProjects(res.data));
        } catch (_) {
          try {
            const res2 = await axios.get('/api/projects', { signal: controller.signal });
            setProjects(coerceProjects(res2.data));
          } catch (_) {}
        }
      })();
      return () => controller.abort();
    }

    const id = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects?search=${encodeURIComponent(q)}`, { signal: controller.signal });
        setProjects(coerceProjects(res.data));
        setError('');
      } catch (err1) {
        try {
          const res2 = await axios.get(`/api/projects?search=${encodeURIComponent(q)}`, { signal: controller.signal });
          setProjects(coerceProjects(res2.data));
          setError('');
        } catch (e) {
          // swallow; client-side filter will still apply on current list
        }
      }
    }, 400);

    return () => { clearTimeout(id); controller.abort(); };
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(p => {
      const title = (p.title || p.projectName || '').toLowerCase();
      const domain = (p.domain || '').toLowerCase();
      return title.includes(q) || domain.includes(q);
    });
  }, [projects, query]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setForm({ title: '', domain: '', description: '', deadline: '', mentorName: '', mentorEmail: '' });
    setTeamMembers([{ name: '', role: '' }]);
    setFormErrors({});
  };

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const updateTeamMember = (idx, key, value) => {
    setTeamMembers(prev => prev.map((tm, i) => (i === idx ? { ...tm, [key]: value } : tm)));
  };

  const addTeamMember = () => setTeamMembers(prev => [...prev, { name: '', role: '' }]);
  const removeTeamMember = (idx) => setTeamMembers(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.mentorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mentorEmail)) errs.mentorEmail = 'Invalid email';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        teamMembers: teamMembers.filter(tm => tm.name || tm.role),
      };
      try {
        await axios.post('http://localhost:5000/api/projects', payload);
      } catch (err1) {
        // Fallback to relative path if absolute base fails or CORS/proxy issues
        await axios.post('/api/projects', payload);
      }
      showToast('success', 'Project created');
      closeModal();
      await fetchProjects();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Failed to create project';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-1">Search, browse, and create projects for review</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-96">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔎</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title or domain..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button onClick={openModal} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow">
              + Create Project
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (<SkeletonCard key={i} />))}
          </div>
        ) : error ? (
          <div className="p-4 border rounded-md bg-red-50 text-red-700">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-white">
            <p className="text-gray-600">No projects found. Try a different search or create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((p, idx) => (
                <motion.div
                  key={p._id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{p.title || p.projectName}</h3>
                    {p.domain && <Badge>{p.domain}</Badge>}
                  </div>
                  {p.description && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500 space-y-1">
                      {p.deadline && (
                        <p>Deadline: <span className="font-medium text-gray-800">{new Date(p.deadline).toLocaleDateString()}</span></p>
                      )}
                      {p.createdAt && (
                        <p>Created: {new Date(p.createdAt).toLocaleDateString()}</p>
                      )}
                      {(p.mentorName || p.mentorEmail) && (
                        <p>Mentor: <span className="font-medium text-gray-800">{p.mentorName}</span> {p.mentorEmail && <span className="text-gray-500">({p.mentorEmail})</span>}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {Array.isArray(p.teamMembers) && p.teamMembers.length > 0 && (
                        <Avatars members={p.teamMembers} />
                      )}
                      {p._id && (
                        <Link to={`/projects/${p._id}/review`} className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                          Review
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Create Project</h2>
                  <p className="text-xs text-gray-500">Fill in details and submit to save</p>
                </div>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-sm font-medium">Project Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => updateForm('title', e.target.value)}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${formErrors.title ? 'border-red-300 focus:ring-red-400' : 'focus:ring-blue-500'}`}
                  />
                  {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium">Domain</label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={e => updateForm('domain', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => updateForm('deadline', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team Members</label>
                  <div className="space-y-3">
                    {teamMembers.map((tm, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Name"
                          value={tm.name}
                          onChange={e => updateTeamMember(idx, 'name', e.target.value)}
                          className="col-span-5 px-3 py-2 border rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          value={tm.role}
                          onChange={e => updateTeamMember(idx, 'role', e.target.value)}
                          className="col-span-5 px-3 py-2 border rounded-md"
                        />
                        <button type="button" onClick={() => removeTeamMember(idx)} className="col-span-2 px-3 py-2 text-white bg-red-500 rounded-md hover:bg-red-600">
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addTeamMember} className="px-3 py-2 text-white bg-gray-700 rounded-md hover:bg-gray-800">
                      + Add Member
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Mentor Name</label>
                    <input
                      type="text"
                      value={form.mentorName}
                      onChange={e => updateForm('mentorName', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Mentor Email</label>
                    <input
                      type="email"
                      value={form.mentorEmail}
                      onChange={e => updateForm('mentorEmail', e.target.value)}
                      className={`mt-1 w-full px-3 py-2 border rounded-md ${formErrors.mentorEmail ? 'border-red-300' : ''}`}
                    />
                    {formErrors.mentorEmail && <p className="mt-1 text-xs text-red-600">{formErrors.mentorEmail}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md border">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
