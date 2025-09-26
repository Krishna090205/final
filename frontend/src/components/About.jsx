import React from 'react';
import { motion } from 'framer-motion';

const Feature = ({ title, desc, icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border">
    <div className="text-2xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-2 text-sm">{desc}</p>
  </div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Project Review Platform</h1>
          <p className="mt-2 text-gray-600">Enabling mentors, mentees, HODs and coordinators to collaborate seamlessly.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature title="For Mentees" icon="🎓" desc="Submit milestones, manage project details, and receive actionable feedback." />
          <Feature title="For Mentors" icon="👨‍🏫" desc="Review submissions, rate projects, and provide guidance efficiently." />
          <Feature title="For HOD & Coordinators" icon="🏛️" desc="Gain visibility across projects and streamline assignments." />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <img src="/banner.png" alt="Platform" className="rounded-2xl shadow border bg-white" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
            <p className="mt-3 text-gray-700">We aim to make academic project management simple and transparent. From ideas to final demos, our platform brings structure to reviews and promotes collaboration between all stakeholders.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
