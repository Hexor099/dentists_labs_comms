import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from 'drizzle-orm';
const sqlite = createClient({ url: "file:local.db" });
const db = drizzle(sqlite);
async function run() {
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS test (id TEXT)`);
    await db.run(sql`INSERT INTO test (id) VALUES ('123')`);
    console.log("Success");
  } catch(e) {
    console.error("Error", e);
  }
}
run();
