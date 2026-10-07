const axios = require('axios');

async function testBooking() {
    try {
        const res = await axios.post('http://localhost:8080/api/auth/login', {
            identifier: 'student@library.edu',
            password: 'password123',
            portal: 'STUDENT'
        });
        const token = res.data.data.token;
        console.log("Logged in. Token:", token.substring(0, 20) + "...");
        
        const bookingRes = await axios.post('http://localhost:8080/api/reservations', {
            spaceId: 1,
            date: new Date().toISOString().split('T')[0],
            startTime: '10:00:00',
            endTime: '12:00:00'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Booking success:", bookingRes.data);
    } catch (e) {
        console.error("Booking error:", e.response ? e.response.data : e.message);
    }
}
testBooking();
