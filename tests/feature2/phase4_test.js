const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { if (body) parsed = JSON.parse(body); } catch (e) { parsed = { error: 'Parse Error', raw: body }; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    
    req.on('error', e => resolve({ status: 0, data: { error: e.message } }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runPhase4Tests() {
  const log = (step, result, status) => console.log(`${step}: ${result} (Status: ${status})`);

  try {
    const TEST_PASSWORD = process.env.TEST_PASSWORD;
    const studentLogin = await request('POST', '/api/auth/login', { identifier: 'student@library.edu', password: TEST_PASSWORD, portal: 'STUDENT' });
    const studentToken = studentLogin.data?.data?.token;
    if (!studentToken) console.log('Student login failed:', studentLogin);
    
    const staffLogin = await request('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: TEST_PASSWORD, portal: 'STAFF' });
    const staffToken = staffLogin.data?.data?.token;

    // 2.1
    let r = await request('GET', '/api/books', null, studentToken);
    log('2.1 read books', r.status === 200 ? 'PASS' : 'FAIL', r.status);
    const books = r.data?.data || [];
    if (books.length < 3) {
      log('FAIL', 'Not enough books in DB', r.status);
      return;
    }
    const b1 = books[0].id;
    const b2 = books[1].id;
    const b3 = books[2].id;

    const initialAlerts = await request('GET', '/api/alerts', null, studentToken);
    if (initialAlerts.data && initialAlerts.data.data) {
       for (let a of initialAlerts.data.data) {
          await request('DELETE', `/api/alerts/${a.id}`, null, studentToken);
       }
    }

    r = await request('POST', '/api/books/search-history', { query: 'test' }, studentToken);
    log('2.1 create search history', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    r = await request('DELETE', '/api/books/search-history', null, studentToken);
    log('2.1 clear history', r.status === 200 || r.status === 204 ? 'PASS' : 'FAIL', r.status);

    await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);
    r = await request('POST', '/api/alerts', { bookId: b1, channels: ['PUSH'] }, studentToken);
    log('2.1 one-tap create alert', r.status === 200 ? 'PASS' : 'FAIL', r.status);
    let alertId1 = r.data?.data?.id;

    // 2.2
    r = await request('GET', `/api/books/${b1}`, null, studentToken);
    log('2.2 read book', r.status === 200 ? 'PASS' : 'FAIL', r.status);
    
    await request('PATCH', `/api/feature3/books/${b2}/status`, { status: 'MISSING' }, staffToken);
    r = await request('POST', '/api/alerts', { bookId: b2, channels: ['PUSH'] }, studentToken);
    log('2.2 create alert', r.status === 200 ? 'PASS' : 'FAIL', r.status);
    let alertId2 = r.data?.data?.id;

    r = await request('DELETE', `/api/alerts/${alertId2}`, null, studentToken);
    log('2.2 cancel alert', r.status === 200 || r.status === 204 ? 'PASS' : 'FAIL', r.status);

    // 2.3
    await request('PATCH', `/api/feature3/books/${b3}/status`, { status: 'MISSING' }, staffToken);
    r = await request('POST', '/api/alerts', { bookId: b3, channels: ['EMAIL'] }, studentToken);
    log('2.3 create alert', r.status === 200 ? 'PASS' : 'FAIL', r.status);
    let alertId3 = r.data?.data?.id;

    r = await request('PATCH', `/api/alerts/${alertId3}`, { channels: ['PUSH', 'EMAIL'] }, studentToken);
    log('2.3 update channels', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    // 2.4 read, undo
    r = await request('GET', `/api/books/${b3}`, null, studentToken);
    log('2.4 read', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    r = await request('DELETE', `/api/alerts/${alertId3}`, null, studentToken);
    log('2.4 undo (cancel)', r.status === 200 || r.status === 204 ? 'PASS' : 'FAIL', r.status);

    // 2.5
    r = await request('GET', '/api/alerts', null, studentToken);
    log('2.5 read alerts', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    // E2E Flow
    if (alertId1) {
      await request('DELETE', `/api/alerts/${alertId1}`, null, studentToken);
    }
    await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);
    let e2eAlert = await request('POST', '/api/alerts', { bookId: b1, channels: ['PUSH'] }, studentToken);
    
    // staff updates it to AVAILABLE
    await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'AVAILABLE' }, staffToken);
    
    // student's catalogue shows AVAILABLE
    let bookE2e = await request('GET', `/api/books/${b1}`, null, studentToken);
    let e2eAlerts = await request('GET', '/api/alerts', null, studentToken);
    let notifiedAlert = e2eAlerts.data?.data?.find(a => a.id === e2eAlert.data?.data?.id);
    
    log('E2E Flow', (bookE2e.data?.data?.status === 'AVAILABLE' && notifiedAlert?.status === 'NOTIFIED') ? 'PASS' : 'FAIL', `Book: ${bookE2e.data?.data?.status}, Alert: ${notifiedAlert?.status}`);

    // Feature 3 Checks
    r = await request('GET', '/api/feature3/books?search=Human', null, staffToken);
    log('F3 Inventory Search', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    r = await request('GET', '/api/feature3/dashboard', null, staffToken);
    log('F3 Dashboard', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    // Restore state (Book 1 MISSING, 1 WAITING alert, 1 NOTIFIED alert)
    // Clear all alerts
    const allAlerts = await request('GET', '/api/alerts', null, studentToken);
    if (allAlerts.data && allAlerts.data.data) {
       for (let a of allAlerts.data.data) {
          await request('DELETE', `/api/alerts/${a.id}`, null, studentToken);
       }
    }
    
    await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);
    await request('PATCH', `/api/feature3/books/${b2}/status`, { status: 'MISSING' }, staffToken);
    await request('PATCH', `/api/feature3/books/${b3}/status`, { status: 'MISSING' }, staffToken);
    
    await request('POST', '/api/alerts', { bookId: b2, channels: ['PUSH'] }, studentToken);
    
    let a3 = await request('POST', '/api/alerts', { bookId: b3, channels: ['EMAIL'] }, studentToken);
    await request('PATCH', `/api/feature3/books/${b3}/status`, { status: 'AVAILABLE' }, staffToken);
    
    log('State Restore', 'PASS', 200);

  } catch(e) {
    console.error(e);
  }
}
runPhase4Tests();
