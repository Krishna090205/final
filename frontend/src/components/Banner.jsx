import React from 'react';
import banner from '/banner.png';

function Banner() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-32 md:py-48 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center relative z-10">

        {/* Left Content */}
        <div className="w-full md:w-1/2 order-2 md:order-1 mt-10 md:mt-0 animate-fade-in-up">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse-slow">
                Welcome to
              </span>
              <br />
              <span className="text-gray-900">Project Review Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl">
              Your ultimate hub for sharing, reviewing, and refining projects. At <strong className="text-indigo-600">Project Review Platform</strong>, we believe in the power of constructive feedback and collaboration to help you take your work to the next level.
              <br /><br />
              Join our community to showcase your innovations, receive valuable insights, and contribute to the growth of others. Let's build, review, and grow — together.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="btn-primary transform hover:scale-105 shadow-2xl">
                Get Started
              </button>
              <button className="btn-outline">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center animate-float">
          <div className="relative">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl transform rotate-6 scale-110 animate-pulse-slow"></div>

            {/* Image container with enhanced styling */}
            <div className="relative bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              <img
                src={banner}
                alt="Project Collaboration Illustration"
                className="relative max-w-full h-auto rounded-2xl shadow-lg"
              />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse-slow"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/5 to-transparent"></div>

        {/* Animated shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        {/* Geometric patterns */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
      </div>
    </section>
  );
}

export default Banner;
