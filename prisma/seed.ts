import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedAll } from "./seed-data";

// Full reset + seed. Wipes content, orders and enquiries — for local development only.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

if (process.env.NODE_ENV === "production" && process.env.FORCE_SEED !== "1") {
  console.error("Refusing to reset a production database. Set FORCE_SEED=1 if you really mean it.");
  process.exit(1);
}

seedAll(db, { reset: true })
  .then(() => console.log("🍀 Seeded Mamon Brews"))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
