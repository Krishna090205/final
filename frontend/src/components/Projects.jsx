import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AddProjectForm from './AddProjectForm';

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
    {children}
  </span>
);

const Avatars = ({ members = [] }) => (
  <div className="flex -space-x-2">
    {members.slice(0, 5).map((m, i) => (
      <div
        key={i}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-medium ring-2 ring-white shadow-sm"
        title={`${m.name}${m.role ? ' - ' + m.role : ''}`}
      >
        {(m.name || '?').substring(0, 1).toUpperCase()}
      </div>
    ))}
    {members.length > 5 && (
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-medium ring-2 ring-white shadow-sm">
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
        className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-xl border text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700'
            : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700'
        }`}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <span className="font-semibold">{toast.type === 'error' ? 'Error' : 'Success'}</span>
          <span className="opacity-80">•</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 text-lg font-bold transition-opacity"
          >
            ×
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SkeletonCard = () => (
  <div className="project-card animate-pulse">
    <div className="project-card-header h-32">
      <div className="h-6 w-2/3 bg-white/20 rounded mb-2"></div>
      <div className="h-4 w-1/3 bg-white/20 rounded"></div>
    </div>
    <div className="project-card-body">
      <div className="h-16 w-full bg-gray-100 rounded mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
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

  // Fetch mentors and mentees for the form
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch mentors
        const { data: mentorsData, error: mentorsError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'mentor');

        if (mentorsError) {
          console.error('Error fetching mentors:', mentorsError);
        } else {
          setMentors(mentorsData || []);
        }

        // Fetch mentees
        const { data: menteesData, error: menteesError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('role', 'mentee');

        if (menteesError) {
          console.error('Error fetching mentees:', menteesError);
        } else {
          setMentees(menteesData || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Get current user for role-based access
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    fetchUsers();
  }, []);

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
      setError('');

      console.log('Fetching projects from Supabase...');

      // Role-based project fetching
      let query = supabase.from('projects').select('*');

      if (currentUser?.role === 'mentor' && currentUser?.email) {
        // For mentors, fetch only their projects
        query = query.eq('mentorEmail', currentUser.email);
      }
      // For mentees and unauthenticated users, show all projects

      const { data: projectsData, error: projectsError } = await query;

      if (projectsError) {
        console.error('Supabase fetch projects error:', projectsError);
        setError('Failed to fetch projects from database');
        return;
      }

      console.log('Projects response:', projectsData);
      setProjects(projectsData || []);

    } catch (e) {
      console.error('Unexpected error in fetchProjects:', e);
      setError('An unexpected error occurred while loading projects');
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
      // Reload full list when query is cleared
      if (q.length === 0) {
        fetchProjects();
      }
      return () => controller.abort();
    }

    const id = setTimeout(async () => {
      try {
        console.log(`Searching for: "${q}"`);

        // Search in Supabase
        const { data: searchResults, error: searchError } = await supabase
          .from('projects')
          .select('*')
          .or(`title.ilike.%${q}%,domain.ilike.%${q}%,description.ilike.%${q}%,githubRepo.ilike.%${q}%`);

        if (searchError) {
          console.error('Search error:', searchError);
          setError('Search functionality is currently unavailable');
          return;
        }

        console.log('Search response:', searchResults);
        setProjects(searchResults || []);
        setError('');

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search failed:', err);
          setError('Search functionality is currently unavailable');
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
      const description = (p.description || '').toLowerCase();
      const githubRepo = (p.githubRepo || '').toLowerCase();
      return title.includes(q) || domain.includes(q) || description.includes(q) || githubRepo.includes(q);
    });
  }, [projects, query]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
  };

  const handleProjectCreated = () => {
    closeModal();
    fetchProjects(); // Refresh the projects list
    showToast('success', 'Project created successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            Projects Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover innovative projects, collaborate with talented developers, and contribute to the next generation of technology
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Projects
                {currentUser?.role && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({currentUser.role === 'mentor' ? 'Mentor View' : currentUser.role === 'hod' ? 'Admin View' : 'General View'})
                  </span>
                )}
              </h2>
              <p className="text-gray-600">
                {currentUser?.role === 'mentor'
                  ? 'Projects you are mentoring'
                  : currentUser?.role === 'hod'
                  ? 'All projects with mentor and mentee details'
                  : 'Search, browse, and create projects for review'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-96">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by title, domain, or description..."
                  className="input-enhanced pl-12"
                />
              </div>
              {/* Show create button for authenticated users who can create projects */}
              {currentUser?.userId && (
                <>
                  {currentUser.role === 'mentee' && (
                    <button onClick={openModal} className="btn-primary">
                      + Create Project
                    </button>
                  )}
                  {currentUser.role === 'hod' && (
                    <button onClick={openModal} className="btn-secondary">
                      + Create Project (Admin)
                    </button>
                  )}
                </>
              )}
              {/* Show login prompt for non-authenticated users */}
              {!currentUser?.userId && (
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-medium">
                  Login to Create Project
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 border-2 border-red-200 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 text-red-700 text-center"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-medium">{error}</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50"
          >
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-xl text-gray-600 font-medium">
              {currentUser?.role === 'mentor'
                ? 'No projects assigned to you yet.'
                : currentUser?.role === 'hod'
                ? 'No projects found.'
                : 'No projects found. Try a different search or create one.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((p, idx) => (
                <motion.div
                  key={p.id || p._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="project-card group"
                >
                  <div className="project-card-header">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white leading-tight flex-1">
                        {p.title || p.projectName}
                      </h3>
                      {p.domain && <Badge>{p.domain}</Badge>}
                    </div>
                    {p.description && (
                      <p className="text-white/90 text-sm line-clamp-2 opacity-90">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="project-card-body">
                    {/* GitHub Repo Link */}
                    {p.githubRepo && (
                      <div className="mb-4">
                        <a
                          href={p.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          View Repository
                        </a>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {p.deadline && (
                          <div>
                            <span className="text-gray-500">Deadline:</span>
                            <p className="font-medium text-gray-900">{new Date(p.deadline).toLocaleDateString()}</p>
                          </div>
                        )}
                        {p.createdAt && (
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium text-gray-900">{new Date(p.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {(p.mentorName || p.mentorEmail) && (
                        <div>
                          <span className="text-gray-500 text-sm">Mentor:</span>
                          <p className="font-medium text-gray-900">{p.mentorName || p.mentorEmail}</p>
                        </div>
                      )}

                      {/* HOD view shows additional details */}
                      {currentUser?.role === 'hod' && p.mentee && (
                        <div>
                          <span className="text-gray-500 text-sm">Mentee:</span>
                          <p className="font-medium text-gray-900">{p.mentee.name}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {Array.isArray(p.teamMembers) && p.teamMembers.length > 0 && (
                          <Avatars members={p.teamMembers} />
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(p.id || p._id) && (
                          <Link
                            to={`/projects/${p.id || p._id}/review`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Create New Project</h2>
                    <p className="text-indigo-100 mt-1">Fill in all project details and submit</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white/80 hover:text-white text-2xl font-bold transition-colors p-2 hover:bg-white/10 rounded-full"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <AddProjectForm
                  mentors={mentors}
                  mentees={mentees}
                  onProjectCreated={handleProjectCreated}
                  onCancel={closeModal}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
