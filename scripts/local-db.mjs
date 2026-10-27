// Local PostgreSQL for development (no Docker needed). Data lives in ../pgdata.
// Usage: node scripts/local-db.mjs   (leave it running; Ctrl+C to stop)
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../../pgdata", import.meta.url));
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: 5433, persistent: true, initdbFlags: ["--encoding=UTF8", "--locale=C"] });

if (!existsSync(dir)) {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("mamon");
} else {
  await pg.start();
}
console.log("Postgres ready on postgres://postgres:postgres@localhost:5433/mamon");
const stop = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
