import React from 'react';
import banner from '/banner.png';

function Banner() {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-purple-50 py-32 md:py-48">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 order-2 md:order-1 mt-10 md:mt-0">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome to <span className="from-pink-600">Project Review Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Your ultimate hub for sharing, reviewing, and refining projects. At <strong>Project Review Platform</strong>, we believe in the power of constructive feedback and collaboration to help you take your work to the next level.
              <br /><br />
              Join our community to showcase your innovations, receive valuable insights, and contribute to the growth of others. Let’s build, review, and grow — together.
            </p>
            <div className="mt-8">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-lg"></div>
            <img
              src={banner}
              alt="Project Collaboration Illustration"
              className="max-w-full h-auto border-2 border-gray-300 rounded-xl"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
      </div>
    </section>
  );
}

export default Banner;
