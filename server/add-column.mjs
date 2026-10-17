import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const url2 = "postgresql://neondb_owner:npg_GIHh1ktam8YT@ep-polished-bar-ayjhd43d-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const pool = new Pool({ connectionString: url2 });
  
  console.log("Applying column update: Adding updatedAt to ResearchSummary if not exists...");
  await pool.query(`ALTER TABLE "ResearchSummary" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
  console.log("SUCCESS: updatedAt added to ResearchSummary!");

  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ResearchSummary';
  `);
  console.log("Updated columns in ResearchSummary:", res.rows.map(r => r.column_name));

  await pool.end();
}

run();
