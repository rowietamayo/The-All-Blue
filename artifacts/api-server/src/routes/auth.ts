import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = Number(process.env.JWT_MAX_AGE_MS) || 24 * 60 * 60 * 1000; // 1 day

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

  if (JWT_SECRET) {
    try {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
      const secure = process.env.NODE_ENV === "production";
      const sameSite: "none" | "lax" = secure ? "none" : "lax";
      res.cookie(COOKIE_NAME, token, { httpOnly: true, secure, sameSite, maxAge: COOKIE_MAX_AGE });
    } catch (err) {
      // continue without cookie
    }
  }

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

  if (JWT_SECRET) {
    try {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
      const secure = process.env.NODE_ENV === "production";
      const sameSite: "none" | "lax" = secure ? "none" : "lax";
      res.cookie(COOKIE_NAME, token, { httpOnly: true, secure, sameSite, maxAge: COOKIE_MAX_AGE });
    } catch (err) {
      // continue without cookie
    }
  }

  res.json({ success: true, user: { id: user.id, phone: user.phone, name: user.name, role: user.role, createdAt: user.createdAt } });
});

export default router;
