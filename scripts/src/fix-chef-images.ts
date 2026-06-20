import { chefsTable, db } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Fixing broken chef image URLs...");

  // Charlotte Chiffon - replace broken  URL with a working Unsplash pastry chef image
  const chiffonResult = await db
    .update(chefsTable)
    .set({
      imageUrl:
        "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=800",
    })
    .where(eq(chefsTable.name, "Charlotte Chiffon"))
    .returning();
  console.log(`Updated Charlotte Chiffon: ${chiffonResult.length} row(s)`);

  // Charlotte Lola - replace broken ImageKit URL with a working Unsplash pastry chef image
  const lolaResult = await db
    .update(chefsTable)
    .set({
      imageUrl:
        "https://images.unsplash.com/photo-1612538498613-55b9c1db5d58?auto=format&fit=crop&q=80&w=800",
    })
    .where(eq(chefsTable.name, "Charlotte Lola"))
    .returning();
  console.log(`Updated Charlotte Lola: ${lolaResult.length} row(s)`);

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fix failed:", err);
  process.exit(1);
});
