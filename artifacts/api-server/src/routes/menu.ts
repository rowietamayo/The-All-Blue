import { Router, type IRouter } from "express";
import { db, menuItemsTable, reviewsTable } from "@workspace/db";
import { eq, like, avg, count, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/menu/featured", async (req, res): Promise<void> => {
  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.isFeatured, true));

  const enriched = await Promise.all(items.map(async (item) => {
    const [stats] = await db.select({
      rating: avg(reviewsTable.rating),
      reviewCount: count(reviewsTable.id),
    }).from(reviewsTable).where(eq(reviewsTable.menuItemId, item.id));
    return {
      ...item,
      rating: stats?.rating ? parseFloat(String(stats.rating)) : null,
      reviewCount: Number(stats?.reviewCount ?? 0),
    };
  }));

  res.json(enriched);
});

router.get("/menu/categories", async (_req, res): Promise<void> => {
  const rows = await db.selectDistinct({ category: menuItemsTable.category }).from(menuItemsTable);
  res.json(rows.map(r => r.category));
});

router.get("/menu", async (req, res): Promise<void> => {
  const { origin, category, search } = req.query as { origin?: string; category?: string; search?: string };

  let query = db.select().from(menuItemsTable);
  const conditions = [];

  if (origin) conditions.push(eq(menuItemsTable.origin, origin));
  if (category) conditions.push(eq(menuItemsTable.category, category));
  if (search) conditions.push(like(menuItemsTable.name, `%${search}%`));

  const items = conditions.length > 0
    ? await db.select().from(menuItemsTable).where(and(...conditions))
    : await db.select().from(menuItemsTable);

  const enriched = await Promise.all(items.map(async (item) => {
    const [stats] = await db.select({
      rating: avg(reviewsTable.rating),
      reviewCount: count(reviewsTable.id),
    }).from(reviewsTable).where(eq(reviewsTable.menuItemId, item.id));
    return {
      ...item,
      rating: stats?.rating ? parseFloat(String(stats.rating)) : null,
      reviewCount: Number(stats?.reviewCount ?? 0),
    };
  }));

  res.json(enriched);
});

router.post("/menu", async (req, res): Promise<void> => {
  const body = req.body as {
    name?: string; description?: string; price?: number;
    origin?: string; category?: string; imageUrl?: string;
    isAvailable?: boolean; isFeatured?: boolean;
  };
  if (!body.name || body.price == null || !body.origin || !body.category) {
    res.status(400).json({ error: "name, price, origin, and category are required" });
    return;
  }

  const [item] = await db.insert(menuItemsTable).values({
    name: body.name,
    description: body.description ?? null,
    price: body.price,
    origin: body.origin,
    category: body.category,
    imageUrl: body.imageUrl ?? null,
    isAvailable: body.isAvailable ?? true,
    isFeatured: body.isFeatured ?? false,
  }).returning();

  res.status(201).json({ ...item, rating: null, reviewCount: 0 });
});

router.get("/menu/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id));
  if (!item) { res.status(404).json({ error: "Menu item not found" }); return; }

  const [stats] = await db.select({
    rating: avg(reviewsTable.rating),
    reviewCount: count(reviewsTable.id),
  }).from(reviewsTable).where(eq(reviewsTable.menuItemId, id));

  res.json({
    ...item,
    rating: stats?.rating ? parseFloat(String(stats.rating)) : null,
    reviewCount: Number(stats?.reviewCount ?? 0),
  });
});

export default router;
