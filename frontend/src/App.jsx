import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Banner from './components/Banner';
import Footer from './components/Footer';
import HODDashboard from './components/HODDashboard';
import Login from './components/Login';
import MenteeDashboard from './components/MenteeDashboard';
import MentorDashboard from './components/MentorDashboard';
import Navbar from './components/Navbar';
import ProjectCoordinatorDashboard from './components/ProjectCoordinatorDashboard';
import Projects from './components/Projects';
import Signup from './components/Signup';
import ReviewPage from './components/ReviewPage';
import ProjectDetails from './components/ProjectDetails';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<><Banner /><Footer /></>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/projects/:id/review" element={<ReviewPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/project-coordinator-dashboard" element={<ProjectCoordinatorDashboard />} />
        <Route path="/hod-dashboard" element={<HODDashboard />} /> 
      </Routes>
    </Router>
  );
}

export default App;