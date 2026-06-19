import { Router, type IRouter } from "express";
import { db, menuItemsTable, chefsTable, reviewsTable, ordersTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [[menuCount], [chefCount], [reviewStats], [orderCount]] = await Promise.all([
    db.select({ count: count() }).from(menuItemsTable),
    db.select({ count: count() }).from(chefsTable),
    db.select({ count: count(), avg: avg(reviewsTable.rating) }).from(reviewsTable),
    db.select({ count: count() }).from(ordersTable),
  ]);

  const originRows = await db.selectDistinct({ origin: menuItemsTable.origin }).from(menuItemsTable);
  const originBreakdown: Record<string, number> = {};
  await Promise.all(originRows.map(async ({ origin }) => {
    const [{ cnt }] = await db.select({ cnt: count() }).from(menuItemsTable).where(eq(menuItemsTable.origin, origin));
    originBreakdown[origin] = Number(cnt);
  }));

  res.json({
    totalMenuItems: Number(menuCount.count),
    totalChefs: Number(chefCount.count),
    totalReviews: Number(reviewStats.count),
    averageRating: reviewStats.avg ? parseFloat(String(reviewStats.avg)) : 0,
    totalOrders: Number(orderCount.count),
    originBreakdown,
  });
});

router.get("/dashboard/popular", async (_req, res): Promise<void> => {
  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.isFeatured, true)).limit(5);
  if (items.length < 5) {
    const more = await db.select().from(menuItemsTable).limit(5 - items.length);
    const ids = new Set(items.map(i => i.id));
    for (const item of more) if (!ids.has(item.id)) items.push(item);
  }

  const enriched = await Promise.all(items.slice(0, 5).map(async (item) => {
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

export default router;
