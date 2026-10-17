import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const url1 = "postgresql://neondb_owner:npg_duZ8tnKrH1hY@ep-polished-bar-ayjhd43d-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";
const url2 = "postgresql://neondb_owner:npg_GIHh1ktam8YT@ep-polished-bar-ayjhd43d-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function test(name, url) {
  console.log(`Testing ${name}...`);
  try {
    const pool = new Pool({ connectionString: url });
    const res = await pool.query('SELECT current_user, current_database(), count(*) from "User";');
    console.log(`${name} SUCCESS:`, res.rows);
    await pool.end();
  } catch (err) {
    console.error(`${name} ERROR:`, err.message);
  }
}

async function run() {
  await test('URL 1 (server/.env - npg_duZ8...)', url1);
  await test('URL 2 (server/src/.env - npg_GIHh...)', url2);
}

run();
