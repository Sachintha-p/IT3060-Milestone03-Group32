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
      res.on('end', () => resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null }));
    });
    
    req.on('error', e => reject(e));
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
    const studentLogin = await request('POST', '/api/auth/login', { identifier: 'student@library.edu', password: 'password123', portal: 'STUDENT' });
    const studentToken = studentLogin.data.data.token;
    
    const staffLogin = await request('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: 'password123', portal: 'STAFF' });
    const staffToken = staffLogin.data.data.token;

    // 1. Student PATCH status -> 403
    let res = await request('PATCH', '/api/books/1/status', { status: 'AVAILABLE' }, studentToken);
    if (res.status === 403) log('1. Student PATCH book status', 'PASS', res.status, res.data.message || 'Forbidden');
    else log('1. Student PATCH book status', 'FAIL', res.status, JSON.stringify(res.data));

    // 2. Guest GET books, GET book by id -> 200. POST alerts -> 401/403
    res = await request('GET', '/api/books');
    let res2 = await request('GET', '/api/books/1');
    let res3 = await request('POST', '/api/alerts', { bookId: 1, channels: ['EMAIL'] });
    if (res.status === 200 && res2.status === 200 && (res3.status === 401 || res3.status === 403)) {
      log('2. Guest endpoints access', 'PASS', `${res.status}, ${res3.status}`, 'GET allowed, POST forbidden');
    } else {
      log('2. Guest endpoints access', 'FAIL', `${res.status}, ${res2.status}, ${res3.status}`, 'Unexpected status codes');
    }

    // Prepare a MISSING book
    const booksList = await request('GET', '/api/books');
    const missingBook = booksList.data.data.find(b => b.status === 'MISSING' && b.id !== 1); // use book 2 if missing
    let targetBookId = missingBook ? missingBook.id : 1;
    // let's force book 2 to MISSING just in case
    await request('PATCH', '/api/feature3/books/2/status', { status: 'MISSING' }, staffToken);
    targetBookId = 2;

    // 3. Student creates reminder on MISSING book, then creates again -> 409
    await request('POST', '/api/alerts', { bookId: targetBookId, channels: ['PUSH'] }, studentToken);
    res = await request('POST', '/api/alerts', { bookId: targetBookId, channels: ['EMAIL'] }, studentToken);
    if (res.status === 409) log('3. Duplicate reminder on MISSING', 'PASS', res.status, res.data.message || 'Conflict');
    else log('3. Duplicate reminder on MISSING', 'FAIL', res.status, JSON.stringify(res.data));

    // 4. Cancel reminder, then create new one -> success
    const studentAlerts = await request('GET', '/api/alerts', null, studentToken);
    const targetAlert = studentAlerts.data.data.find(a => a.book.id === targetBookId && a.status === 'WAITING');
    if (targetAlert) {
      await request('DELETE', `/api/alerts/${targetAlert.id}`, null, studentToken);
      res = await request('POST', '/api/alerts', { bookId: targetBookId, channels: ['PUSH'] }, studentToken);
      if (res.status === 200) log('4. Cancel and recreate reminder', 'PASS', res.status, 'Success');
      else log('4. Cancel and recreate reminder', 'FAIL', res.status, JSON.stringify(res.data));
    } else {
      log('4. Cancel and recreate reminder', 'FAIL', 'N/A', 'Alert not found to cancel');
    }

    // 5. Student creates reminder on AVAILABLE book -> 400
    // Force book 3 to AVAILABLE
    await request('PATCH', '/api/feature3/books/3/status', { status: 'AVAILABLE' }, staffToken);
    res = await request('POST', '/api/alerts', { bookId: 3, channels: ['PUSH'] }, studentToken);
    if (res.status === 400) log('5. Reminder on AVAILABLE book', 'PASS', res.status, res.data.message || 'Bad Request');
    else log('5. Reminder on AVAILABLE book', 'FAIL', res.status, JSON.stringify(res.data));

    // 6. User B (staff) tries to edit User A's alert -> 403
    const newAlerts = await request('GET', '/api/alerts', null, studentToken);
    const userAAlert = newAlerts.data.data.find(a => a.status === 'WAITING');
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
      if (res.status === 400) log('7. PATCH alert with empty channels', 'PASS', res.status, res.data.message || 'Bad Request');
      else log('7. PATCH alert with empty channels', 'FAIL', res.status, JSON.stringify(res.data));
    }

    // 8. Search history logic
    await request('POST', '/api/books/search-history', { query: ' ' }, studentToken); // blank
    const beforeHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const beforeCount = beforeHistory.data.data.length;
    for (let i = 1; i <= 12; i++) {
      await request('POST', '/api/books/search-history', { query: `Test Query ${i}` }, studentToken);
    }
    const afterHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const has10 = afterHistory.data.data.length === 10;
    
    await request('DELETE', '/api/books/search-history', null, studentToken);
    const clearedHistory = await request('GET', '/api/books/search-history', null, studentToken);
    const isCleared = clearedHistory.data.data.length === 0;

    if (has10 && isCleared) log('8. Search history limits and clearing', 'PASS', 200, 'Kept 10, then cleared properly');
    else log('8. Search history limits and clearing', 'FAIL', 200, `Counts: before=${beforeCount}, max=${afterHistory.data.data.length}, final=${clearedHistory.data.data.length}`);

    console.log(results.join('\n'));

  } catch (err) {
    console.error(err);
  }
}

runTests();
