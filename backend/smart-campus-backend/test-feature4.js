const http = require('http');

const BASE_URL = 'http://localhost:8080';

async function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    const req = http.request(BASE_URL + path, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password, portal) {
  const res = await request('POST', '/api/auth/login', { identifier: email, password, portal });
  return res.body.data.token;
}

async function runTests() {
  try {
    console.log("Logging in...");
    const adminToken = await login('admin@library.edu', 'password123', 'STAFF_ADMIN');
    const staffToken = await login('staff@library.edu', 'password123', 'STAFF_ADMIN');
    const studentToken = await login('student@library.edu', 'password123', 'STUDENT');
    
    console.log("Testing as ADMIN...");
    let res = await request('GET', '/api/feature4/users', null, adminToken);
    console.log(`GET /api/feature4/users -> ${res.status}`);
    
    let createdUser = await request('POST', '/api/feature4/users', { name: "Test User", email: "testuser@library.edu", role: "STUDENT", password: "pwd" }, adminToken);
    console.log(`POST /api/feature4/users -> ${createdUser.status}`);
    let newUserId = createdUser.body.data.id;
    
    res = await request('PATCH', `/api/feature4/users/${newUserId}/role`, { role: "STAFF" }, adminToken);
    console.log(`PATCH /api/feature4/users/{id}/role -> ${res.status}`);
    
    res = await request('PATCH', `/api/feature4/users/${newUserId}/status`, { status: "SUSPENDED" }, adminToken);
    console.log(`PATCH /api/feature4/users/{id}/status -> ${res.status}`);
    
    res = await request('DELETE', `/api/feature4/users/${newUserId}`, null, adminToken);
    console.log(`DELETE /api/feature4/users/{id} -> ${res.status}`);
    
    res = await request('POST', '/api/feature4/reports', { type: "Zone Usage", dateFrom: "2026-08-01", dateTo: "2026-08-09" }, adminToken);
    console.log(`POST /api/feature4/reports -> ${res.status}`);
    let reportId = res.body.data.id;
    
    res = await request('GET', '/api/feature4/reports', null, adminToken);
    console.log(`GET /api/feature4/reports -> ${res.status}`);
    
    res = await request('GET', `/api/feature4/reports/${reportId}`, null, adminToken);
    console.log(`GET /api/feature4/reports/{id} -> ${res.status}`);
    
    res = await request('DELETE', `/api/feature4/reports/${reportId}`, null, adminToken);
    console.log(`DELETE /api/feature4/reports/{id} -> ${res.status}`);
    
    res = await request('GET', '/api/feature4/settings', null, adminToken);
    console.log(`GET /api/feature4/settings -> ${res.status}`);
    
    res = await request('PUT', '/api/feature4/settings', { occupancyThreshold: 85, autoGenerateWeeklyReport: false, allowGuestLookups: true }, adminToken);
    console.log(`PUT /api/feature4/settings -> ${res.status}`);
    
    console.log("\nTesting as STAFF...");
    res = await request('GET', '/api/feature4/users', null, staffToken);
    console.log(`GET /api/feature4/users -> ${res.status}`);
    
    console.log("\nTesting as STUDENT...");
    res = await request('GET', '/api/feature4/users', null, studentToken);
    console.log(`GET /api/feature4/users -> ${res.status}`);
    
  } catch (e) {
    console.error("Test error:", e);
  }
}

runTests();
