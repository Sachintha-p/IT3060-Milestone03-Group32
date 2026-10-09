const axios = require('axios');

async function testAlerts() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@library.edu',
      password: 'password123'
    });
    
    const token = loginRes.data.data.token;
    console.log('Got token:', token.substring(0, 10) + '...');
    
    const res = await axios.post('http://localhost:8080/api/feature3/alerts', {
      message: 'Manual alert from Dashboard',
      priority: 'HIGH'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Success!', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error(err);
    }
  }
}

testAlerts();
