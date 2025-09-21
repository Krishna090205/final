import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      try {
        response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      } catch (_) {
        response = await axios.post('/api/auth/login', { email, password });
      }
      const { success, role, mentorId, userId } = response.data;

      if (success) {
        // Persist role so Navbar can show Dashboard link
        if (role) {
          localStorage.setItem('role', role);
        }
        if (userId) {
          localStorage.setItem('userId', userId);
        }
        if (role === 'mentor') {
          localStorage.setItem('mentorId', mentorId); // Save mentorId to localStorage
          navigate('/mentor-dashboard');
        } else if (role === 'mentee') {
          navigate('/mentee-dashboard');
        } else if (role === 'project_coordinator') {
          navigate('/project-coordinator-dashboard');
        } else if (role === 'hod') {
          navigate('/hod-dashboard');
        }
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h3 className="font-bold text-lg mb-4">Login</h3>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor="email" className='block text-sm font-medium'>Email</label>
            <input 
              id="email"
              type="email"
              placeholder='Enter your Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 border rounded-md outline-none'
            />
          </div>

          <div className='mb-4'>
            <label htmlFor="password" className='block text-sm font-medium'>Password</label>
            <input 
              id="password"
              type="password"
              placeholder='Enter your Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2 border rounded-md outline-none'
            />
          </div>

          <div className='mb-4'>
            <button type="submit" className='w-full py-2 px-4 text-white bg-pink-500 rounded-md'>
              Login
            </button>
          </div>

          {loginError && <p className="text-center text-red-500">{loginError}</p>}

          <p className='text-sm text-center'>
            Don't have an account? <a href="/signup" className='text-blue-500 underline'>Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;