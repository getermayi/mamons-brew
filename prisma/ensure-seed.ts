import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedAll } from "./seed-data";

// Runs during deploys: seeds only an empty database, never touches existing data.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

async function main() {
  const existing = await db.siteSettings.findUnique({ where: { id: "site" } });
  if (existing) {
    console.log("Database already seeded — skipping.");
    return;
  }
  await seedAll(db, { reset: false });
  console.log("🍀 Seeded empty database");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
