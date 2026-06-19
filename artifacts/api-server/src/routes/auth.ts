import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { phone, name } = req.body as { phone?: string; name?: string };
  if (!phone) {
    res.status(400).json({ error: "phone is required" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  if (existing.length > 0) {
    res.status(400).json({ error: "Phone already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({ phone, name: name ?? null }).returning();
  res.status(201).json({ success: true, user: { id: user.id, phone: user.phone, name: user.name, role: user.role, createdAt: user.createdAt } });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { phone } = req.body as { phone?: string };
  if (!phone) {
    res.status(400).json({ error: "phone is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  if (!user) {
    res.status(404).json({ error: "Phone number not registered" });
    return;
  }

  res.json({ success: true, user: { id: user.id, phone: user.phone, name: user.name, role: user.role, createdAt: user.createdAt } });
});

export default router;
