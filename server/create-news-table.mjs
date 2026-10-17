import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const url = "postgresql://neondb_owner:npg_GIHh1ktam8YT@ep-polished-bar-ayjhd43d-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const pool = new Pool({ connectionString: url });
  
  console.log("Creating NewsItem table in Neon...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "NewsItem" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "imageUrl" TEXT,
        "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "NewsItem_url_key" ON "NewsItem"("url");
    CREATE INDEX IF NOT EXISTS "NewsItem_category_idx" ON "NewsItem"("category");
    CREATE INDEX IF NOT EXISTS "NewsItem_publishedAt_idx" ON "NewsItem"("publishedAt");
  `);
  console.log("SUCCESS: NewsItem table created in Neon!");

  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'NewsItem';
  `);
  console.log("NewsItem columns:", res.rows.map(r => r.column_name));

  await pool.end();
}

run();
