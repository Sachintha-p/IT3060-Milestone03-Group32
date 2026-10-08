const http = require('http');
const fs = require('fs');

function o(msg) {
  fs.appendFileSync('out.txt', msg + '\n');
}

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve) => {
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

async function run() {
  try {
  const p = process.env.TEST_PASSWORD;
  let res;

  const staffLogin = await request('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: p, portal: 'STAFF' });
  const staffToken = staffLogin.data.data.token;

  const adminLogin = await request('POST', '/api/auth/login', { identifier: 'admin@library.edu', password: p, portal: 'ADMIN' });
  const adminToken = adminLogin.data?.data?.token;

  const studentLogin = await request('POST', '/api/auth/login', { identifier: 'student@library.edu', password: p, portal: 'STUDENT' });
  const studentToken = studentLogin.data.data.token;

  const booksRes = await request('GET', '/api/books');
  const books = booksRes.data.data;
  const b1 = books[0].id;

  // Ensure b1 is MISSING
  await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);

  // Clear student's alerts first
  const alertsRes = await request('GET', '/api/alerts', null, studentToken);
  for (let a of (alertsRes.data?.data || [])) {
     await request('DELETE', `/api/alerts/${a.id}`, null, studentToken);
  }

  // a) staff token POST /api/alerts for a MISSING book
  res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, staffToken);
  o(`a) staff POST /api/alerts: ${res.status}`);

  // b) admin token POST /api/alerts
  if (!adminToken) {
    o(`b) admin POST /api/alerts: No admin user exists`);
  } else {
    res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, adminToken);
    o(`b) admin POST /api/alerts: ${res.status}`);
  }

  // c) no token POST /api/alerts
  res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] });
  o(`c) no token POST /api/alerts: ${res.status}`);

  // d) student token POST /api/alerts for a MISSING book
  res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
  o(`d) student POST /api/alerts (MISSING): ${res.status}`);
  const createdAlertId = res.data?.data?.id;

  // e) student token POST the same book again
  res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
  o(`e) student POST same book again: ${res.status}`);

  // f) student token DELETE that alert, then POST again
  res = await request('DELETE', `/api/alerts/${createdAlertId}`, null, studentToken);
  res = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
  o(`f) student DELETE then POST: ${res.status}`);
  const secondAlertId = res.data?.data?.id;

  // g) no token GET /api/books and GET /api/books/{id}
  const g1 = await request('GET', '/api/books');
  const g2 = await request('GET', `/api/books/${b1}`);
  o(`g) no token GET /api/books: ${g1.status}, GET /api/books/{id}: ${g2.status}`);

  // h) student token PATCH /api/books/{id}/status
  res = await request('PATCH', `/api/books/${b1}/status`, { status: 'AVAILABLE' }, studentToken);
  o(`h) student PATCH /api/books/{id}/status: ${res.status}`);

  // i) staff token PATCH /api/feature3/books/{id}/status to AVAILABLE, then student GET /api/alerts shows NOTIFIED
  await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'AVAILABLE' }, staffToken);
  res = await request('GET', '/api/alerts', null, studentToken);
  const updatedAlert = res.data?.data?.find(a => a.id === secondAlertId);
  o(`i) staff PATCH to AVAILABLE, student GET alerts status: ${updatedAlert?.status}`);

  // j) no token POST /api/books/search-history
  res = await request('POST', '/api/books/search-history', { query: 'test' });
  o(`j) no token POST /api/books/search-history: ${res.status}`);

  for (let i = 1; i <= 12; i++) {
    await request('POST', '/api/books/search-history', { query: `Q${i}` }, studentToken);
  }
  res = await request('GET', '/api/books/search-history', null, studentToken);
  o(`j) 12 queries -> GET length: ${res.data?.data?.length}`);

  await request('POST', '/api/books/search-history', { query: '  ' }, studentToken);
  res = await request('GET', '/api/books/search-history', null, studentToken);
  o(`j) blank query ignored -> GET length: ${res.data?.data?.length}`);

  await request('DELETE', '/api/books/search-history', null, studentToken);
  res = await request('GET', '/api/books/search-history', null, studentToken);
  o(`j) DELETE all -> GET length: ${res.data?.data?.length}`);

  // Regression step 5
  res = await request('GET', '/api/feature3/books?search=the', null, staffToken);
  o(`Step 5: F3 Inventory search: ${res.status}`);
  res = await request('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);
  o(`Step 5: F3 status update: ${res.status}`);
  res = await request('GET', '/api/feature3/dashboard', null, staffToken);
  o(`Step 5: F3 dashboard: ${res.status}`);

  // Print Step 3 info
  o("== DB STATE ==");
  const allB = await request('GET', '/api/books');
  for (let b of allB.data.data) {
     o(`Book ${b.id}: ${b.title} - ${b.status}`);
  }
  const allA = await request('GET', '/api/alerts', null, studentToken);
  for (let a of (allA.data?.data || [])) {
     o(`Alert ${a.id} (user: student, book: ${a.book.id}): ${a.status}`);
  }

  } catch(e) { console.error("FATAL ERROR: ", e); }
  process.exit(0);
}
run();
