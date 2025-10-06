import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // .1 - Hooks setup
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // .2 - Scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // .3 - Base Navbar links
  const baseLinks = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  // .3.1 - Determine role and dashboard link
  const [role, setRole] = useState(null);
  useEffect(() => {
    setRole(localStorage.getItem('role'));
    const onStorage = (e) => {
      if (e.key === 'role') setRole(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Re-check role on route change so same-tab login/logout updates immediately
  useEffect(() => {
    const r = localStorage.getItem('role');
    setRole(r);
  }, [location.pathname]);

  const roleToDashboard = (r) => {
    switch (r) {
      case 'mentee':
      case 'mentor':
        return { path: '/mentor-dashboard', label: 'Mentor Dashboard' };
      case 'hod':
        return { path: '/hod-dashboard', label: 'HOD Dashboard' };
      case 'project_coordinator':
      case 'coordinator':
        return { path: '/project-coordinator-dashboard', label: 'Coordinator Dashboard' };
      default:
        return null;
    }
  };

  // .3.2 - Build final nav links (insert Dashboard after Home when logged-in)
  const navLinks = (() => {
    const links = [...baseLinks];
    const dash = roleToDashboard(role);
    if (dash) {
      // Insert after Home (index 1)
      links.splice(1, 0, { path: dash.path, label: 'Dashboard' });
    }
    return links;
  })();

  // .3.3 - Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('mentorId');
      localStorage.removeItem('currentUser');
      setRole(null);
      navigate('/login');
    } catch (_) {
      // noop
    }
  };

  // .4 - Return UI
  return (
    <>
      {/* .4.1 - Fixed Top Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? 'navbar-glass' : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* .4.1.1 - Brand & Links */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold transition-all duration-300 hover:scale-105">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    PR
                  </span>
                  <span className="text-gray-800 ml-1">Review Platform</span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                      location.pathname === link.path
                        ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {link.label}
                    {location.pathname === link.path && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* .4.1.2 - Mobile & Login */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="inline-flex sm:hidden items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-300"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Always show Login button as requested */}
              <button
                className="btn-outline text-sm px-4 py-2"
                onClick={() => navigate('/login')}
              >
                Login
              </button>

              {/* Show Logout when logged-in */}
              {role && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-sm font-medium"
                  title="Logout"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* .4.2 - Mobile Menu */}
        <div className="sm:hidden px-4 pb-3 pt-2 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* .4.3 - Spacer to push page content below fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar; 