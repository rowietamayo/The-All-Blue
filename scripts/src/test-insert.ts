import { db, menuItemsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Querying all existing menu items...");
  const items = await db.select().from(menuItemsTable);
  console.log("Existing items:");
  for (const item of items) {
    console.log(`- ID: ${item.id}, Name: ${item.name}`);
  }

  console.log("\nQuerying current sequence value for menu_items...");
  try {
    const seqResult = await db.execute(sql`SELECT last_value, is_called FROM menu_items_id_seq`);
    console.log("Sequence status:", seqResult.rows);
  } catch (err) {
    console.error("Could not query sequence status:", err);
  }
}

main().catch(console.error);
