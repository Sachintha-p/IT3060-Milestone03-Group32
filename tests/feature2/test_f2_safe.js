const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
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

const results = [];

function log(item, status, code, notes) {
  results.push(`| ${item} | ${status} | ${code} | ${notes} |`);
}

async function runTests() {
  try {
    const TEST_PASSWORD = process.env.TEST_PASSWORD;
    const studentLogin = await request('POST', '/api/auth/login', { identifier: 'student@library.edu', password: TEST_PASSWORD, portal: 'STUDENT' });
    const studentToken = studentLogin.data?.data?.token;
    
    const staffLogin = await request('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: TEST_PASSWORD, portal: 'STAFF' });
    const staffToken = staffLogin.data?.data?.token;

    let booksRes = await request('GET', '/api/books');
    const books = booksRes.data?.data || [];
    if (books.length < 3) {
      console.log('FAIL: Not enough books');
      return;
    }
    const b1 = books[0].id;
    const b2 = books[1].id;
    const b3 = books[2].id;

    // 1. Student PATCH status -> 403
    let res = await request('PATCH', `/api/books/${b1}/status`, { status: 'AVAILABLE' }, studentToken);
    if (res.status === 403) log('1. Student PATCH book status', 'PASS', res.status, res.data?.message || 'Forbidden');
    else log('1. Student PATCH book status', 'FAIL', res.status, JSON.stringify(res.data));

    // 2. Guest GET books, GET book by id -> 200. POST alerts -> 401/403
    res = await request('GET', '/api/books');
    let res2 = await request('GET', `/api/books/${b1}`);
    let res3 = await request('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] });
    if (res.status === 200 && res2.status === 200 && (res3.status === 401 || res3.status === 403)) {
      log('2. Guest endpoints access', 'PASS', `${res.status}, ${res3.status}`, 'GET allowed, POST forbidden');
    } else {
      log('2. Guest endpoints access', 'FAIL', `${res.status}, ${res2.status}, ${res3.status}`, 'Unexpected status codes');
    }

    // Force book 2 to MISSING for testing
    await request('PATCH', `/api/feature3/books/${b2}/status`, { status: 'MISSING' }, staffToken);

    // 3. Student creates reminder on MISSING book, then creates again -> 409
    await request('POST', '/api/alerts', { bookId: b2, channels: ['PUSH'] }, studentToken);
    res = await request('POST', '/api/alerts', { bookId: b2, channels: ['EMAIL'] }, studentToken);
    if (res.status === 409 || res.status === 500) { // Will investigate if 500
      log('3. Duplicate reminder on MISSING', res.status === 409 ? 'PASS' : 'FAIL', res.status, res.data?.message || JSON.stringify(res.data));
    } else {
      log('3. Duplicate reminder on MISSING', 'FAIL', res.status, JSON.stringify(res.data));
    }

    // 4. Cancel reminder, then create new one -> success
    const studentAlerts = await request('GET', '/api/alerts', null, studentToken);
    const targetAlert = studentAlerts.data?.data?.find(a => a.book?.id === b2 && a.status === 'WAITING');
    if (targetAlert) {
      await request('DELETE', `/api/alerts/${targetAlert.id}`, null, studentToken);
      res = await request('POST', '/api/alerts', { bookId: b2, channels: ['PUSH'] }, studentToken);
      if (res.status === 200) log('4. Cancel and recreate reminder', 'PASS', res.status, 'Success');
      else log('4. Cancel and recreate reminder', 'FAIL', res.status, JSON.stringify(res.data));
    } else {
      log('4. Cancel and recreate reminder', 'FAIL', 'N/A', 'Alert not found to cancel');
    }

    // 5. Student creates reminder on AVAILABLE book -> 400
    await request('PATCH', `/api/feature3/books/${b3}/status`, { status: 'AVAILABLE' }, staffToken);
    res = await request('POST', '/api/alerts', { bookId: b3, channels: ['PUSH'] }, studentToken);
    if (res.status === 400) log('5. Reminder on AVAILABLE book', 'PASS', res.status, res.data?.message || 'Bad Request');
    else log('5. Reminder on AVAILABLE book', 'FAIL', res.status, JSON.stringify(res.data));

    // 6. User B (staff) tries to edit User A's alert -> 403
    const newAlerts = await request('GET', '/api/alerts', null, studentToken);
    const userAAlert = newAlerts.data?.data?.find(a => a.status === 'WAITING');
    if (userAAlert) {
      let r1 = await request('DELETE', `/api/alerts/${userAAlert.id}`, null, staffToken);
      let r2 = await request('PATCH', `/api/alerts/${userAAlert.id}`, { channels: ['EMAIL'] }, staffToken);
      let r3 = await request('PATCH', `/api/alerts/${userAAlert.id}/read`, null, staffToken);
      if (r1.status === 403 && r2.status === 403 && r3.status === 403) {
        log('6. Cross-user alert modification', 'PASS', 403, 'User B blocked from User A alert');
      } else {
        log('6. Cross-user alert modification', 'FAIL', `${r1.status}, ${r2.status}, ${r3.status}`, 'Expected 403s');
      }
    } else {
      log('6. Cross-user alert modification', 'FAIL', 'N/A', 'No WAITING alert found for User A');
    }

    // 7. PATCH /api/alerts/{id} with empty channels -> 400
    if (userAAlert) {
      res = await request('PATCH', `/api/alerts/${userAAlert.id}`, { channels: [] }, studentToken);
      if (res.status === 400) log('7. PATCH alert with empty channels', 'PASS', res.status, res.data?.message || 'Bad Request');
      else log('7. PATCH alert with empty channels', 'FAIL', res.status, JSON.stringify(res.data));
    }

    // 8. Search history logic
    await request('POST', '/api/books/search-history', { query: ' ' }, studentToken);
    const beforeHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const beforeCount = beforeHistory.data?.data?.length || 0;
    
    for (let i = 1; i <= 12; i++) {
      await request('POST', '/api/books/search-history', { query: `Test Query ${i}` }, studentToken);
    }
    const afterHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const has10 = afterHistory.data?.data?.length === 10;
    
    await request('DELETE', '/api/books/search-history', null, studentToken);
    const clearedHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const isCleared = clearedHistory.data?.data?.length === 0;

    if (has10 && isCleared) log('8. Search history limits and clearing', 'PASS', 200, 'Kept 10, then cleared properly');
    else log('8. Search history limits and clearing', 'FAIL', 200, `Counts: max=${afterHistory.data?.data?.length}, final=${clearedHistory.data?.data?.length}`);

    console.log(results.join('\n'));
    console.log("DONE");

  } catch (err) {
    console.error('ERROR in test:', err);
  }
}

runTests();
