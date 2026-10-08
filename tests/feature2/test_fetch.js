async function run() {
  try {
    const p = process.env.TEST_PASSWORD;
    const req = async (method, path, body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://127.0.0.1:8080${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const txt = await res.text();
      let data;
      try { data = JSON.parse(txt); } catch(e) { data = txt; }
      return { status: res.status, data };
    };

    console.log("Starting...");
    const staffLogin = await req('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: p, portal: 'STAFF' });
    const staffToken = staffLogin.data?.data?.token;

    const adminLogin = await req('POST', '/api/auth/login', { identifier: 'admin@library.edu', password: p, portal: 'ADMIN' });
    const adminToken = adminLogin.data?.data?.token;

    const studentLogin = await req('POST', '/api/auth/login', { identifier: 'student@library.edu', password: p, portal: 'STUDENT' });
    const studentToken = studentLogin.data?.data?.token;

    const booksRes = await req('GET', '/api/books');
    const books = booksRes.data?.data || [];
    const b1 = books[0]?.id;

    if (!b1) {
       console.log("No books found"); return;
    }

    // Ensure b1 is MISSING
    await req('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);

    // clear student alerts
    const alertsRes = await req('GET', '/api/alerts', null, studentToken);
    for (let a of (alertsRes.data?.data || [])) {
      await req('DELETE', `/api/alerts/${a.id}`, null, studentToken);
    }

    let r;
    r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, staffToken);
    console.log(`a) staff POST /api/alerts: ${r.status}`);

    if (!adminToken) {
      console.log(`b) admin POST /api/alerts: No admin user exists`);
    } else {
      r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, adminToken);
      console.log(`b) admin POST /api/alerts: ${r.status}`);
    }

    r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] });
    console.log(`c) no token POST /api/alerts: ${r.status}`);

    r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
    console.log(`d) student POST /api/alerts (MISSING): ${r.status}`);
    const alertId1 = r.data?.data?.id;

    r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
    console.log(`e) student POST same book again: ${r.status}`);

    await req('DELETE', `/api/alerts/${alertId1}`, null, studentToken);
    r = await req('POST', '/api/alerts', { bookId: b1, channels: ['EMAIL'] }, studentToken);
    console.log(`f) student DELETE then POST: ${r.status}`);
    const alertId2 = r.data?.data?.id;

    const g1 = await req('GET', '/api/books');
    const g2 = await req('GET', `/api/books/${b1}`);
    console.log(`g) no token GET /api/books: ${g1.status}, GET /api/books/{id}: ${g2.status}`);

    r = await req('PATCH', `/api/books/${b1}/status`, { status: 'AVAILABLE' }, studentToken);
    console.log(`h) student PATCH /api/books/{id}/status: ${r.status}`);

    await req('PATCH', `/api/feature3/books/${b1}/status`, { status: 'AVAILABLE' }, staffToken);
    r = await req('GET', '/api/alerts', null, studentToken);
    const updatedAlert = (r.data?.data || []).find(a => a.id === alertId2);
    console.log(`i) staff PATCH to AVAILABLE, student GET alerts status: ${updatedAlert?.status}`);

    r = await req('POST', '/api/books/search-history', { query: 'test' });
    console.log(`j) no token POST /api/books/search-history: ${r.status}`);

    for (let i = 1; i <= 12; i++) {
      await req('POST', '/api/books/search-history', { query: `Q${i}` }, studentToken);
    }
    r = await req('GET', '/api/books/search-history', null, studentToken);
    console.log(`j) 12 queries -> GET length: ${r.data?.data?.length}`);

    await req('POST', '/api/books/search-history', { query: '  ' }, studentToken);
    r = await req('GET', '/api/books/search-history', null, studentToken);
    console.log(`j) blank query ignored -> GET length: ${r.data?.data?.length}`);

    await req('DELETE', '/api/books/search-history', null, studentToken);
    r = await req('GET', '/api/books/search-history', null, studentToken);
    console.log(`j) DELETE all -> GET length: ${r.data?.data?.length}`);

    // Regression
    r = await req('GET', '/api/feature3/books?search=the', null, staffToken);
    console.log(`Step 5: F3 Inventory search: ${r.status}`);
    r = await req('PATCH', `/api/feature3/books/${b1}/status`, { status: 'MISSING' }, staffToken);
    console.log(`Step 5: F3 status update: ${r.status}`);
    r = await req('GET', '/api/feature3/dashboard', null, staffToken);
    console.log(`Step 5: F3 dashboard: ${r.status}`);

    console.log("== DB STATE ==");
    const allB = await req('GET', '/api/books');
    for (let b of (allB.data?.data || [])) {
       console.log(`Book ${b.id}: ${b.title} - ${b.status}`);
    }
    const allA = await req('GET', '/api/alerts', null, studentToken);
    for (let a of (allA.data?.data || [])) {
       console.log(`Alert ${a.id} (user: student, book: ${a.book.id}): ${a.status}`);
    }
    process.exit(0);
  } catch(e) {
    console.error("FATAL ERROR:", e);
    process.exit(1);
  }
}
run();
