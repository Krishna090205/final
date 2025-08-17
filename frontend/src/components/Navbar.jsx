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

  // .3 - Navbar links
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/reviews', label: 'Reviews' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  // .4 - Return UI
  return (
    <>
      {/* .4.1 - Fixed Top Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 shadow-lg backdrop-blur-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* .4.1.1 - Brand & Links */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-primary transition-colors duration-300">
                  <span className="text-primary">PR</span> Review Platform
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* .4.1.2 - Mobile & Login */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="inline-flex sm:hidden items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <a
                className="bg-black text-white p-2.5 rounded-md hover:bg-slate-800 duration-300 cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Login
              </a>
            </div>
          </div>
        </div>

        {/* .4.2 - Mobile Menu */}
        <div className="sm:hidden px-4 pb-3 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* .4.3 - Spacer to push page content below fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
 