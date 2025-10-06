const axios = require('axios');

// Test the contact API endpoint
async function testContactAPI() {
  try {
    console.log('Testing contact API endpoint...');
    const response = await axios.post('http://localhost:5000/api/contact', {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from the API test script'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', response.status, response.data);
    return response;
  } catch (error) {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return error.response;
  }
}

// Test the admin contacts endpoint
async function testAdminContactsAPI() {
  try {
    console.log('Testing admin contacts API endpoint...');
    const response = await axios.get('http://localhost:5000/api/admin/contacts');
    console.log('Admin API Response:', response.status, response.data);
    return response;
  } catch (error) {
    console.error('Admin API Error:', error.response?.status, error.response?.data || error.message);
    return error.response;
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');

  console.log('1. Testing contact submission...');
  await testContactAPI();

  console.log('\n2. Testing admin contacts retrieval...');
  await testAdminContactsAPI();

  console.log('\nTests completed.');
}

runTests();
