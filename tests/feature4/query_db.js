const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_WtjB87EPmUzA@ep-spring-sunset-b489m5c6-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  
  console.log("=== DB CONNECTION SUCCESS ===");
  
  // 1. Force Admin Password
  const hash = bcrypt.hashSync('password123', 10);
  await client.query("UPDATE users SET password = $1 WHERE email = 'admin@library.edu'", [hash]);
  console.log("Updated admin password to password123 (hash: " + hash + ")");
  
  // 2. Fetch independent query counts
  console.log("\n=== INDEPENDENT QUERIES ===");
  
  const usageQuery1 = await client.query("SELECT COUNT(*) FROM feature1_reservations WHERE reservation_date BETWEEN '2026-09-08' AND '2026-10-08'");
  console.log("USAGE (Total Reservations):", usageQuery1.rows[0].count);
  
  const usageQuery2 = await client.query("SELECT status, COUNT(*) as cnt FROM feature1_reservations WHERE reservation_date BETWEEN '2026-09-08' AND '2026-10-08' GROUP BY status");
  console.log("USAGE (By Status):", usageQuery2.rows);

  const occQuery1 = await client.query("SELECT s.zone, SUM(s.capacity) as cap FROM feature1_spaces s GROUP BY s.zone");
  console.log("OCCUPANCY (Capacity by Zone):", occQuery1.rows);
  
  const occQuery2 = await client.query("SELECT COUNT(r.id) FROM feature1_reservations r JOIN feature1_spaces s ON r.space_id = s.id WHERE s.zone = 'Quiet Zone' AND r.reservation_date = CURRENT_DATE AND CURRENT_TIME BETWEEN r.start_time AND r.end_time AND r.status IN ('0', '1', 'RESERVED', 'CHECKED_IN')");
  console.log("OCCUPANCY (Active for Quiet Zone):", occQuery2.rows[0].count);

  const booksQuery1 = await client.query("SELECT status, COUNT(*) as cnt FROM feature3_books GROUP BY status");
  console.log("BOOKS (By Status):", booksQuery1.rows);
  
  const booksQuery2 = await client.query("SELECT COUNT(*) FROM feature2_restock_alerts WHERE created_at >= '2026-09-08' AND created_at <= '2026-10-09'");
  console.log("BOOKS (Reminders):", booksQuery2.rows[0].count);

  const usersQuery1 = await client.query("SELECT role, COUNT(*) as cnt FROM users GROUP BY role");
  console.log("USERS (By Role):", usersQuery1.rows);
  
  const usersQuery2 = await client.query("SELECT status, COUNT(*) as cnt FROM users GROUP BY status");
  console.log("USERS (By Status):", usersQuery2.rows);
  
  await client.end();
}

run().catch(console.error);
