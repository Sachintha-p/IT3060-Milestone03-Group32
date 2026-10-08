async function run() {
  try {
    const p = 'password123';
    const req = async (method, path, body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://127.0.0.1:8080${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      const txt = await res.text();
      let data; try { data = JSON.parse(txt); } catch(e) { data = txt; }
      return { status: res.status, data };
    };

    const staffLogin = await req('POST', '/api/auth/login', { identifier: 'staff@library.edu', password: p, portal: 'STAFF' });
    const staffToken = staffLogin.data?.data?.token;

    const studentLogin = await req('POST', '/api/auth/login', { identifier: 'student@library.edu', password: p, portal: 'STUDENT' });
    const studentToken = studentLogin.data?.data?.token;

    const booksRes = await req('GET', '/api/books');
    const books = booksRes.data?.data || [];
    const ids = books.map(b => b.id);

    // Reset books: 3 MISSING, 2 CHECKED_OUT, 7 AVAILABLE
    for (let i = 0; i < ids.length; i++) {
      let st = 'AVAILABLE';
      if (i < 3) st = 'MISSING';
      else if (i < 5) st = 'CHECKED_OUT';
      await req('PATCH', `/api/feature3/books/${ids[i]}/status`, { status: st }, staffToken);
    }

    // Delete all existing student alerts
    const alertsRes = await req('GET', '/api/alerts', null, studentToken);
    for (let a of (alertsRes.data?.data || [])) {
      await req('DELETE', `/api/alerts/${a.id}`, null, studentToken);
    }

    // Create 1 WAITING on book[0], 1 NOTIFIED on book[1]
    const id1 = ids[0];
    const id2 = ids[1];
    
    // WAITING alert
    await req('POST', '/api/alerts', { bookId: id1, channels: ['EMAIL'] }, studentToken);

    // NOTIFIED alert
    await req('POST', '/api/alerts', { bookId: id2, channels: ['EMAIL'] }, studentToken);
    await req('PATCH', `/api/feature3/books/${id2}/status`, { status: 'AVAILABLE' }, staffToken);
    await req('PATCH', `/api/feature3/books/${id2}/status`, { status: 'MISSING' }, staffToken);

    console.log('== DB STATE RESTORED ==');
    const allB = await req('GET', '/api/books');
    for (let b of (allB.data?.data || [])) {
       console.log(`Book ${b.id}: ${b.title} - ${b.status}`);
    }
    const allA = await req('GET', '/api/alerts', null, studentToken);
    for (let a of (allA.data?.data || [])) {
       console.log(`Alert ${a.id} (user: student, book: ${a.book.id}): ${a.status}`);
    }
  } catch(e) { console.error(e); }
}
run();
