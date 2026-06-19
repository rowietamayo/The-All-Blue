import { Router, type IRouter } from "express";
import { db, chefsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/chefs", async (_req, res): Promise<void> => {
  const chefs = await db.select().from(chefsTable);
  res.json(chefs);
});

router.get("/chefs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [chef] = await db.select().from(chefsTable).where(eq(chefsTable.id, id));
  if (!chef) { res.status(404).json({ error: "Chef not found" }); return; }

  res.json(chef);
});

router.post("/chefs", async (req, res): Promise<void> => {
  const { name, specialty, bio, imageUrl, yearsExperience } = req.body as {
    name?: string; specialty?: string;
    bio?: string; imageUrl?: string; yearsExperience?: number | string;
  };

  if (!name || !specialty) {
    res.status(400).json({ error: "name and specialty are required" });
    return;
  }

  const [created] = await db.insert(chefsTable).values({
    name,
    specialty,
    bio: bio ?? null,
    imageUrl: imageUrl ?? null,
    yearsExperience: Number(yearsExperience) || 0,
  }).returning();

  res.status(201).json(created);
});

export default router;
