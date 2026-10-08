async function runTests() {
  const login = async (email, portal) => {
    const r = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password: 'password123', portal })
    });
    return (await r.json()).data.token;
  };

  try {
    const studentToken = await login('student@library.edu', 'STUDENT');
    const staffToken = await login('staff@library.edu', 'STAFF');

    const authHeaders = (token) => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
    const get = async (path, token = null) => fetch(`http://localhost:8080${path}`, { headers: token ? authHeaders(token) : undefined });
    const post = async (path, body, token = null) => fetch(`http://localhost:8080${path}`, { method: 'POST', headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const patch = async (path, body, token = null) => fetch(`http://localhost:8080${path}`, { method: 'PATCH', headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const del = async (path, token = null) => fetch(`http://localhost:8080${path}`, { method: 'DELETE', headers: token ? authHeaders(token) : undefined });

    console.log("---- RESULTS ----");
    
    // 1. Student PATCH
    let r = await patch('/api/books/1/status', { status: 'AVAILABLE' }, studentToken);
    console.log(`1. Student PATCH status: ${r.status === 403 ? 'PASS' : 'FAIL'} (${r.status})`);

    // 2. Guest access
    let g1 = await get('/api/books');
    let g2 = await get('/api/books/1');
    let g3 = await post('/api/alerts', { bookId: 1, channels: ['EMAIL'] });
    console.log(`2. Guest access: ${g1.status === 200 && g2.status === 200 && (g3.status === 401 || g3.status === 403) ? 'PASS' : 'FAIL'} (${g1.status}, ${g2.status}, ${g3.status})`);

    // Ensure Book 2 is MISSING
    await patch('/api/feature3/books/2/status', { status: 'MISSING' }, staffToken);

    // 3. Duplicate reminder
    await post('/api/alerts', { bookId: 2, channels: ['PUSH'] }, studentToken);
    let dup = await post('/api/alerts', { bookId: 2, channels: ['EMAIL'] }, studentToken);
    let dupBody = await dup.json().catch(e => ({error: 'parse'}));
    console.log(`3. Duplicate reminder: ${dup.status === 409 ? 'PASS' : 'FAIL'} (${dup.status}) - ${JSON.stringify(dupBody)}`);

    // 4. Cancel and recreate
    let alerts = await (await get('/api/alerts', studentToken)).json();
    let targetAlert = alerts.data?.find(a => a.book?.id === 2 && a.status === 'WAITING');
    if (targetAlert) {
      let cancel = await del(`/api/alerts/${targetAlert.id}`, studentToken);
      let recreate = await post('/api/alerts', { bookId: 2, channels: ['PUSH'] }, studentToken);
      console.log(`4. Cancel and recreate: ${recreate.status === 200 ? 'PASS' : 'FAIL'} (${cancel.status} -> ${recreate.status})`);
    } else {
      console.log(`4. Cancel and recreate: FAIL (No alert found)`);
    }

    // 5. Alert on AVAILABLE book
    await patch('/api/feature3/books/3/status', { status: 'AVAILABLE' }, staffToken);
    let availAlert = await post('/api/alerts', { bookId: 3, channels: ['PUSH'] }, studentToken);
    console.log(`5. Alert on AVAILABLE: ${availAlert.status === 400 ? 'PASS' : 'FAIL'} (${availAlert.status})`);

    // 6. User B modifies User A
    alerts = await (await get('/api/alerts', studentToken)).json();
    userAAlert = alerts.data?.find(a => a.status === 'WAITING');
    if (userAAlert) {
      let m1 = await del(`/api/alerts/${userAAlert.id}`, staffToken);
      let m2 = await patch(`/api/alerts/${userAAlert.id}`, { channels: ['EMAIL'] }, staffToken);
      let m3 = await patch(`/api/alerts/${userAAlert.id}/read`, null, staffToken);
      console.log(`6. Cross-user modify: ${m1.status === 403 && m2.status === 403 && m3.status === 403 ? 'PASS' : 'FAIL'} (${m1.status}, ${m2.status}, ${m3.status})`);
    } else {
      console.log(`6. Cross-user modify: FAIL (No WAITING alert)`);
    }

    // 7. PATCH empty channels
    if (userAAlert) {
      let emptyPatch = await patch(`/api/alerts/${userAAlert.id}`, { channels: [] }, studentToken);
      console.log(`7. Empty channels PATCH: ${emptyPatch.status === 400 ? 'PASS' : 'FAIL'} (${emptyPatch.status})`);
    } else {
      console.log(`7. Empty channels PATCH: FAIL`);
    }

    // 8. Search History
    await post('/api/books/search-history', { query: ' ' }, studentToken);
    for (let i=1; i<=12; i++) {
      await post('/api/books/search-history', { query: `Q${i}` }, studentToken);
    }
    let histAfter = await (await get('/api/books/search-history', studentToken)).json();
    await del('/api/books/search-history', studentToken);
    let histFinal = await (await get('/api/books/search-history', studentToken)).json();
    console.log(`8. Search history logic: ${histAfter.data?.length === 10 && histFinal.data?.length === 0 ? 'PASS' : 'FAIL'} (${histAfter.data?.length} -> ${histFinal.data?.length})`);

  } catch(e) {
    console.error("FATAL ERROR:", e);
  }
}
runTests();
