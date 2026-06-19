import { Router, type IRouter } from "express";
import { db, usersTable, ordersTable, reviewsTable, menuItemsTable, chefsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

async function requireAdmin(userId: number | null): Promise<boolean> {
  if (!userId) return false;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user?.role === "admin";
}

function parseUserId(header: unknown): number | null {
  const id = parseInt(String(header ?? ""), 10);
  return isNaN(id) ? null : id;
}

router.get("/admin/users", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.put("/admin/users/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, phone, role } = req.body as { name?: string | null; phone?: string; role?: string };
  const updates: Partial<{ name: string | null; phone: string; role: string }> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  res.json(updated);
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ success: true });
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const rows = await db
    .select({
      id: ordersTable.id,
      reference: ordersTable.reference,
      userId: ordersTable.userId,
      customerName: usersTable.name,
      status: ordersTable.status,
      total: ordersTable.total,
      deliveryAddress: ordersTable.deliveryAddress,
      deliveryLat: ordersTable.deliveryLat,
      deliveryLng: ordersTable.deliveryLng,
      estimatedMinutes: ordersTable.estimatedMinutes,
      items: ordersTable.items,
      adminNote: ordersTable.adminNote,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(ordersTable.createdAt);

  res.json(rows);
});

router.patch("/admin/orders/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, adminNote } = req.body as { status?: string; adminNote?: string | null };
  const updates: Partial<{ status: string; adminNote: string | null }> = {};
  if (status !== undefined) updates.status = status;
  if (adminNote !== undefined) updates.adminNote = adminNote;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Order not found" }); return; }

  res.json(updated);
});

router.delete("/admin/orders/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(ordersTable).where(eq(ordersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Order not found" }); return; }

  res.json({ success: true });
});

router.put("/admin/menu/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, description, price, origin, category, imageUrl, isAvailable, isFeatured } = req.body as {
    name?: string; description?: string; price?: number; origin?: string;
    category?: string; imageUrl?: string; isAvailable?: boolean; isFeatured?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (origin !== undefined) updates.origin = origin;
  if (category !== undefined) updates.category = category;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;
  if (isFeatured !== undefined) updates.isFeatured = isFeatured;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(menuItemsTable).set(updates).where(eq(menuItemsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Menu item not found" }); return; }

  res.json({ ...updated, rating: null, reviewCount: 0 });
});

router.delete("/admin/menu/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Menu item not found" }); return; }

  res.json({ success: true });
});

router.get("/admin/reviews", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

router.delete("/admin/reviews/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(reviewsTable).where(eq(reviewsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Review not found" }); return; }

  res.json({ success: true });
});

// ── CHEFS ADMIN ──

router.put("/admin/chefs/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, specialty, bio, imageUrl, yearsExperience } = req.body as {
    name?: string; specialty?: string;
    bio?: string | null; imageUrl?: string | null; yearsExperience?: number | string;
  };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (specialty !== undefined) updates.specialty = specialty;
  if (bio !== undefined) updates.bio = bio;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (yearsExperience !== undefined) updates.yearsExperience = Number(yearsExperience) || 0;

  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  const [updated] = await db.update(chefsTable).set(updates).where(eq(chefsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Chef not found" }); return; }

  res.json(updated);
});

router.delete("/admin/chefs/:id", async (req, res): Promise<void> => {
  const userId = parseUserId(req.headers["x-user-id"]);
  if (!(await requireAdmin(userId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(chefsTable).where(eq(chefsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Chef not found" }); return; }

  res.json({ success: true });
});

export default router;
