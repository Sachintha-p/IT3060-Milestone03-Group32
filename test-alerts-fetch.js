async function testAlerts() {
  try {
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@library.edu', password: 'password123', portal: 'STAFF' })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.data || !loginData.data.token) {
      console.log('Login failed', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('Got token:', token.substring(0, 10) + '...');
    
    const res = await fetch('http://localhost:8080/api/feature3/alerts', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Manual alert from Dashboard', priority: 'HIGH' })
    });
    
    const resData = await res.json();
    console.log('Success!', res.status, resData);
  } catch (err) {
    console.error(err);
  }
}

testAlerts();
