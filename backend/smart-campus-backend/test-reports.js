const fs = require('fs');

async function test() {
    console.log("Logging in as Admin...");
    let res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'admin@library.edu', password: 'password123', portal: 'ADMIN' })
    });
    if (!res.ok) { console.error("Login failed", await res.text()); return; }
    let data = await res.json();
    let token = data.data.token;
    console.log("Admin logged in. Token length:", token.length);

    const fromDate = "2026-08-01";
    const toDate = "2026-10-31";
    const types = ["USAGE", "OCCUPANCY", "BOOKS", "USERS"];

    for (let type of types) {
        console.log(`\n--- Generating ${type} Report ---`);
        let repRes = await fetch('http://localhost:8080/api/feature4/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ type, dateFrom: fromDate, dateTo: toDate })
        });
        if (!repRes.ok) {
            console.error(`Failed to generate ${type}`, await repRes.text());
        } else {
            let repData = await repRes.json();
            console.log(JSON.stringify(repData.data, null, 2));
        }
    }
}

test();
