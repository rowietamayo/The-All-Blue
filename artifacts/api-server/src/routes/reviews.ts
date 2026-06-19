import { Router, type IRouter } from "express";
import { db, reviewsTable, ordersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/reviews — list all reviews (optionally filtered by menuItemId)
router.get("/reviews", async (req, res): Promise<void> => {
  const { menuItemId } = req.query as { menuItemId?: string };
  if (menuItemId) {
    const id = parseInt(menuItemId, 10);
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.menuItemId, id))
      .orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
    return;
  }
  const reviews = await db
    .select()
    .from(reviewsTable)
    .orderBy(desc(reviewsTable.createdAt));
  res.json(reviews);
});

// GET /api/reviews/by-order/:orderId — check if a user already reviewed this order
router.get("/reviews/by-order/:orderId", async (req, res): Promise<void> => {
  const userIdHeader = req.headers["x-user-id"];
  if (!userIdHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = parseInt(userIdHeader as string, 10);
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) {
    res.status(400).json({ error: "Invalid orderId" });
    return;
  }

  const existing = await db
    .select()
    .from(reviewsTable)
    .where(and(eq(reviewsTable.orderId, orderId), eq(reviewsTable.userId, userId)));

  res.json({ reviewed: existing.length > 0, reviews: existing });
});

// POST /api/reviews — submit a review
// Accepts either a general review or an order-linked review.
// If orderId is provided, validates ownership and delivered status, and prevents duplicates.
router.post("/reviews", async (req, res): Promise<void> => {
  const { menuItemId, rating, comment, userName, userId, orderId } = req.body as {
    menuItemId?: number;
    rating?: number;
    comment?: string;
    userName?: string;
    userId?: number;
    orderId?: number;
  };

  if (!rating || !comment) {
    res.status(400).json({ error: "rating and comment are required" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "rating must be 1-5" });
    return;
  }

  // If this is an order-linked review, validate the order
  if (orderId != null && userId != null) {
    // Verify the order exists, belongs to this user, and is delivered
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)));

    if (!order) {
      res.status(403).json({ error: "Order not found or access denied" });
      return;
    }
    if (order.status !== "delivered") {
      res.status(400).json({ error: "You can only review delivered orders" });
      return;
    }

    // Prevent duplicate reviews for the same order
    const existing = await db
      .select()
      .from(reviewsTable)
      .where(and(eq(reviewsTable.orderId, orderId), eq(reviewsTable.userId, userId)));

    if (existing.length > 0) {
      res.status(409).json({ error: "You have already reviewed this order" });
      return;
    }
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      menuItemId: menuItemId ?? null,
      userId: userId ?? null,
      orderId: orderId ?? null,
      rating,
      comment,
      userName: userName ?? "Anonymous",
    })
    .returning();

  res.status(201).json(review);
});

export default router;
