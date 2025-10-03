import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState(''); // Added name state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mentor');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    // Validate password (still keep for frontend validation, but won't send to backend)
    if (password.length < 6) {
      setPasswordError('Password should be at least 6 characters long.');
      return;
    }

    try {
      let response;
      const payload = { name, email, role }; // Modified payload: added name, removed password

      try {
        response = await axios.post('http://localhost:5000/api/signup', payload); // Corrected endpoint
      } catch (_) {
        response = await axios.post('/api/signup', payload); // Corrected endpoint
      }

      setServerMessage(response.data.message);
      setName(''); // Clear name
      setEmail('');
      setPassword('');
      setRole('mentor');
    } catch (error) {
      if (error.response && error.response.data.message) {
        setServerMessage(error.response.data.message);
      } else {
        setServerMessage('Error: Unable to register user');
      }
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h3 className="font-bold text-lg mb-4">Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md outline-none"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className="w-full px-3 py-2 border rounded-md outline-none"
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">
              Password (Not stored in database for this setup)
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className="w-full px-3 py-2 border rounded-md outline-none"
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            <p className="text-sm text-yellow-600">
              Warning: Password is not stored in the database with the current schema.
              Consider using Supabase Authentication for secure password handling.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md outline-none"
            >
              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
              <option value="project_coordinator">Project Coordinator</option>
              <option value="hod">HOD</option>
            </select>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className="w-full py-2 px-4 text-white bg-pink-500 rounded-md"
            >
              Sign Up
            </button>
          </div>

          {serverMessage && (
            <p className="text-center text-green-500">{serverMessage}</p>
          )}

          <p className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
