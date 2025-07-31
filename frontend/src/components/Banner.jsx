import React from 'react';
import banner from '../../public/Banner.webp';

function Banner() {
  return (
    <section className="bg-white py-12 md:py-24">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 order-2 md:order-1 mt-10 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Welcome to <span className="text-pink-600">Project Review Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            Your ultimate hub for sharing, reviewing, and refining projects. At <strong>Project Review Platform</strong>, we believe in the power of constructive feedback and collaboration to help you take your work to the next level.
            <br /><br />
            Join our community to showcase your innovations, receive valuable insights, and contribute to the growth of others. Let’s build, review, and grow — together.
          </p>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
          <img
            src={banner}
            alt="Project Collaboration Illustration"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}

export default Banner;
