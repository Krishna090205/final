import React, { useState } from 'react';

function Footer() {
  // State to track which section is open
  const [openSection, setOpenSection] = useState(null);

  // Function to handle link clicks
  const handleLinkClick = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Main Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">PR Review Platform</h2>
            <p className="text-gray-300">
              Your ultimate hub for sharing, reviewing, and refining projects. Join our community to grow and innovate together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <a 
                onClick={() => handleLinkClick('about')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </a>
              <a 
                onClick={() => handleLinkClick('contact')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </a>
              <a 
                onClick={() => handleLinkClick('help')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Help Center
              </a>
              <a 
                onClick={() => handleLinkClick('terms')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <nav className="space-y-2">
              <a 
                onClick={() => handleLinkClick('guides')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Project Guides
              </a>
              <a 
                onClick={() => handleLinkClick('templates')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Project Templates
              </a>
              <a 
                onClick={() => handleLinkClick('blog')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                Blog
              </a>
              <a 
                onClick={() => handleLinkClick('faqs')} 
                className="link link-hover text-gray-300 hover:text-white transition-colors"
              >
                FAQs
              </a>
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h2v4l.586-.586z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p className="text-sm">© 2025 PR Review Platform. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a 
                onClick={() => handleLinkClick('privacy')} 
                className="text-sm hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                onClick={() => handleLinkClick('cookies')} 
                className="text-sm hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;