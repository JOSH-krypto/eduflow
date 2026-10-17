import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const url2 = "postgresql://neondb_owner:npg_GIHh1ktam8YT@ep-polished-bar-ayjhd43d-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const pool = new Pool({ connectionString: url2 });
  const res = await pool.query('SELECT id, email, name, "createdAt" from "User";');
  console.log("USERS IN NEON:", res.rows);
  await pool.end();
}

run();
