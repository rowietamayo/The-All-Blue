import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const userIdHeader = req.headers["x-user-id"];
  if (!userIdHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = parseInt(userIdHeader as string, 10);

  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(ordersTable.createdAt);
  res.json(orders);
});

router.post("/orders", async (req, res): Promise<void> => {
  const { deliveryAddress, deliveryLat, deliveryLng, items } = req.body as {
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    items?: Array<{ menuItemId: number; name?: string; quantity: number; price: number }>;
  };

  if (!deliveryAddress || !items || items.length === 0) {
    res.status(400).json({ error: "deliveryAddress and items are required" });
    return;
  }

  const userIdHeader = req.headers["x-user-id"];
  if (!userIdHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = parseInt(userIdHeader as string, 10);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [order] = await db.insert(ordersTable).values({
    userId,
    deliveryAddress,
    deliveryLat: deliveryLat ?? null,
    deliveryLng: deliveryLng ?? null,
    total,
    status: "pending",
    estimatedMinutes: Math.floor(Math.random() * 20) + 25,
    items,
  }).returning();

  res.status(201).json(order);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userIdHeader = req.headers["x-user-id"];
  if (!userIdHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = parseInt(userIdHeader as string, 10);

  const [order] = await db.select().from(ordersTable).where(and(
    eq(ordersTable.id, id),
    eq(ordersTable.userId, userId)
  ));
  
  if (!order) { res.status(404).json({ error: "Order not found or access denied" }); return; }

  res.json(order);
});

export default router;
