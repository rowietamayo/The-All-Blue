import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview, useListOrders, useListReviews, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { MapPin, MessageCircle, Package, RefreshCw, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";

// Lottie animation JSONs (bundled locally for reliability)
import cancelledAnim from "../lottie/cancelled.json";
import deliveredAnim from "../lottie/delivered.json";
import deliveryAnim from "../lottie/out_for_delivery.json";
import pendingAnim from "../lottie/pending.json";
import preparingAnim from "../lottie/preparing.json";

const POLL_INTERVAL = 30_000;

interface LiveIndicatorProps {
  refetch: () => Promise<any>;
}

function LiveIndicator({ refetch }: LiveIndicatorProps) {
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refetch().then(() => {
            setLastUpdated(new Date());
          });
          return POLL_INTERVAL / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [refetch]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Live — refreshing in {countdown}s
      {lastUpdated && (
        <span className="text-green-600/70 ml-1">· updated {lastUpdated.toLocaleTimeString()}</span>
      )}
      <RefreshCw className="w-3 h-3 ml-0.5 text-green-600/60" />
    </div>
  );
}

const STATUS_CONFIG: Record<string, {
  anim: object;
  label: string;
  bg: string;
  badge: string;
  description: string;
}> = {
  pending: {
    anim: pendingAnim,
    label: "Pending",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Your order has been received and is waiting to be confirmed.",
  },
  preparing: {
    anim: preparingAnim,
    label: "Preparing",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Our chefs are crafting your legendary feast right now!",
  },
  out_for_delivery: {
    anim: deliveryAnim,
    label: "Out for Delivery",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Your order is on its way — sailing through the Grand Line!",
  },
  delivered: {
    anim: deliveredAnim,
    label: "Delivered",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-800 border-green-200",
    description: "Enjoy your meal! Bon appétit! 🍽️",
  },
  cancelled: {
    anim: cancelledAnim,
    label: "Cancelled",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-800 border-red-200",
    description: "This order has been cancelled. We're sorry for the inconvenience.",
  },
};

const PROGRESS: Record<string, number> = {
  pending: 10,
  preparing: 40,
  out_for_delivery: 70,
  delivered: 100,
  cancelled: 100,
};

interface ReviewFormProps {
  orderId: number;
  userId: number;
  userName: string;
  onDone: () => void;
}

function ReviewForm({ orderId, userId, userName, onDone }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({ title: "Please write a comment.", variant: "destructive" });
      return;
    }
    createReview.mutate(
      {
        data: {
          rating,
          comment,
          userName,
          userId,
          orderId,
        } as Parameters<typeof createReview.mutate>[0]["data"],
      },
      {
        onSuccess: () => {
          toast({
            title: "Review submitted! 🌟",
            description: "Thank you for sharing your experience, sailor!",
          });
          queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
          onDone();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.error ?? "Could not submit review.";
          toast({ title: "Error", description: message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-border pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h5 className="font-semibold text-sm text-primary">Leave a Review</h5>

      {/* Star rating */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="p-0.5 focus:outline-none transition-transform hover:scale-110"
              data-testid={`btn-review-star-${star}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hovered || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground self-center">
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][hovered || rating]}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Your experience</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your meal from the All Blue? 🍽️"
          className="min-h-[90px] text-sm resize-none"
          data-testid="input-order-review-comment"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={createReview.isPending}
          data-testid="btn-submit-order-review"
        >
          {createReview.isPending ? "Submitting…" : "Submit Review"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDone}
          className="text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function Track() {
  const { currentUser } = useAuth();
  const [showAll, setShowAll] = useState(false);
  // Track which orders have been reviewed in this session
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<number>>(new Set());
  // Track which order's review form is open
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);

  // Fetch reviews to populate reviewedOrderIds
  const { data: reviews } = useListReviews();

  useEffect(() => {
    if (reviews && currentUser) {
      const ids = reviews
        .filter((r: any) => r.userId === currentUser.id && r.orderId != null)
        .map((r: any) => r.orderId as number);
      setReviewedOrderIds(new Set(ids));
    }
  }, [reviews, currentUser]);


  const requestOpts = currentUser
    ? { headers: { "x-user-id": String(currentUser.id) } }
    : undefined;

  const { data: orders, isLoading, refetch } = useListOrders(
    { request: requestOpts },
    // @ts-expect-error hook option not reflected in generated types
    { enabled: !!currentUser }
  );

  const sortedOrders = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const latestOrder = sortedOrders[0];
  const pastOrders = sortedOrders.slice(1);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="font-serif text-4xl text-primary mb-4">Track Your Feast</h1>
          <p className="text-muted-foreground mb-4">Follow your legendary meal across the ocean.</p>
        </div>
        <Card className="border-dashed border-2 animate-in fade-in duration-500">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-2xl text-primary mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-6">You must be signed in to track your orders.</p>
            <Link href="/login" className="bg-accent text-accent-foreground px-6 py-2 rounded-md font-medium hover:bg-accent/90 transition-colors" data-testid="btn-track-signin">
              Sign In to Your Account
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-serif text-4xl text-primary mb-4">Track Your Feast</h1>
        <p className="text-muted-foreground mb-4">Follow your legendary meal across the ocean.</p>
        <LiveIndicator refetch={refetch} />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-20 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (sortedOrders.length === 0) ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-2xl text-primary mb-2">No Active Orders</h3>
            <p className="text-muted-foreground mb-6">Your table is empty. Time to order from the All Blue!</p>
            <Link href="/menu" className="bg-accent text-accent-foreground px-6 py-2 rounded-md font-medium hover:bg-accent/90 transition-colors">
              Explore the Menu
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active / Latest Order */}
          {latestOrder && (() => {
            const cfg = STATUS_CONFIG[latestOrder.status] ?? STATUS_CONFIG["pending"];
            const progress = PROGRESS[latestOrder.status] ?? 10;
            const isCancelled = latestOrder.status === "cancelled";
            const isDelivered = latestOrder.status === "delivered";

            return (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Order Tracking</h3>
                <Card key={latestOrder.id} className="overflow-hidden border-border/50 shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  {/* Header */}
                  <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle className="font-serif text-xl text-primary">Order {latestOrder.reference ?? `#${latestOrder.id.toString().padStart(4, '0')}`}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(latestOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-sm px-3 py-1 ${cfg.badge}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Lottie Animation + Status */}
                    <div className={`flex flex-col items-center rounded-2xl py-6 mb-6 ${cfg.bg} transition-colors duration-500`}>
                      <div className="w-36 h-36 flex items-center justify-center">
                        {isCancelled ? (
                          <svg viewBox="0 0 120 120" className="w-28 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="54" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="4"/>
                            <circle cx="60" cy="60" r="42" fill="#FCA5A5" opacity="0.4"/>
                            <line x1="38" y1="38" x2="82" y2="82" stroke="#DC2626" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="82" y1="38" x2="38" y2="82" stroke="#DC2626" strokeWidth="8" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <Lottie
                            animationData={cfg.anim}
                            loop={true}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium mt-2 text-center px-4" style={{ color: "inherit" }}>
                        {cfg.description}
                      </p>
                      {!isDelivered && !isCancelled && latestOrder.estimatedMinutes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Estimated arrival: <span className="font-semibold text-foreground">{latestOrder.estimatedMinutes} min</span>
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Order placed</span>
                        <span>{isCancelled ? "Cancelled" : "Delivered"}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCancelled ? "bg-red-400" :
                            isDelivered ? "bg-green-500" :
                            "bg-accent"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        {["Pending", "Preparing", "Delivery", "Done"].map((step, i) => (
                          <div key={step} className="flex flex-col items-center gap-1">
                            <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors duration-700 ${
                              progress >= (i + 1) * 25
                                ? isCancelled ? "bg-red-400 border-red-400" : "bg-accent border-accent"
                                : "bg-background border-muted-foreground/30"
                            }`} />
                            <span className="text-[10px] text-muted-foreground hidden sm:block">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin note */}
                    {latestOrder.adminNote && (
                      <div className="flex items-start gap-3 mb-6 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageCircle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Message from the kitchen</p>
                          <p className="text-sm text-amber-900 leading-relaxed">{latestOrder.adminNote}</p>
                        </div>
                      </div>
                    )}

                    {/* Delivery & items */}
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <p className="flex-1 break-words">{latestOrder.deliveryAddress}</p>
                      </div>
                      <div className="border-t border-border pt-4">
                        <h5 className="font-medium text-primary mb-3">Order Items</h5>
                        <ul className="space-y-2">
                          {latestOrder.items?.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span><span className="text-muted-foreground">{item.quantity}x</span> {item.name || `Item #${item.menuItemId}`}</span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold text-primary">
                          <span>Total</span>
                          <span>${latestOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {isDelivered && !reviewedOrderIds.has(latestOrder.id) && currentUser && (
                      reviewingOrderId === latestOrder.id ? (
                        <ReviewForm
                          orderId={latestOrder.id}
                          userId={currentUser.id}
                          userName={currentUser.name ?? currentUser.phone}
                          onDone={() => {
                            setReviewingOrderId(null);
                            setReviewedOrderIds(prev => new Set(prev).add(latestOrder.id));
                          }}
                        />
                      ) : (
                        <div className="mt-4 pt-4 border-t border-border flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewingOrderId(latestOrder.id)}
                            className="gap-1.5 text-accent border-accent/40 hover:bg-accent/10"
                            data-testid="btn-review-latest-order"
                          >
                            <Star className="w-4 h-4" /> Review This Order
                          </Button>
                        </div>
                      )
                    )}
                    {reviewedOrderIds.has(latestOrder.id) && (
                      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-green-600">
                        <Star className="w-4 h-4 fill-green-500 text-green-500 animate-in zoom-in-50 duration-300" />
                        Thank you for your review!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* Past Transactions / History Toggle */}
          {pastOrders.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-sm transition-all duration-300 shadow-sm"
                  data-testid="btn-show-all-transactions"
                >
                  {showAll ? "Hide Past Transactions" : `Show all transactions (${pastOrders.length})`}
                </button>
              </div>

              {showAll && (
                <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order History & Details</h3>
                  {pastOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
                    return (
                      <Card key={order.id} className="border-border/50 bg-card/50 shadow-sm overflow-hidden" data-testid={`past-order-card-${order.id}`}>
                        <div className="p-5">
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                              <h4 className="font-serif font-semibold text-lg text-primary">
                                Order {order.reference ?? `#${order.id.toString().padStart(4, '0')}`}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${cfg.badge}`}>
                              {cfg.label}
                            </Badge>
                          </div>

                          {/* Address & Items Summary */}
                          <div className="space-y-3 mt-4 text-sm text-foreground/80">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="truncate">{order.deliveryAddress}</span>
                            </div>

                            <div className="bg-background/40 border border-border/30 rounded-md p-3">
                              <ul className="space-y-1">
                                {order.items?.map((item, idx) => (
                                  <li key={idx} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{item.quantity}x {item.name || `Item #${item.menuItemId}`}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="border-t border-border/30 mt-2 pt-2 flex justify-between font-bold text-xs text-primary">
                                <span>Total Paid</span>
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Kitchen Note / Cancellation Reason */}
                            {order.adminNote && (
                              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/50 border border-amber-200/40 text-xs">
                                <MessageCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-semibold text-amber-700">Kitchen Note: </span>
                                  <span className="text-amber-900 leading-relaxed">{order.adminNote}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {order.status === "delivered" && !reviewedOrderIds.has(order.id) && currentUser && (
                            reviewingOrderId === order.id ? (
                              <ReviewForm
                                orderId={order.id}
                                userId={currentUser.id}
                                userName={currentUser.name ?? currentUser.phone}
                                onDone={() => {
                                  setReviewingOrderId(null);
                                  setReviewedOrderIds(prev => new Set(prev).add(order.id));
                                }}
                              />
                            ) : (
                              <div className="mt-3 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setReviewingOrderId(order.id)}
                                  className="gap-1.5 text-xs text-accent border-accent/40 hover:bg-accent/10"
                                  data-testid={`btn-review-order-${order.id}`}
                                >
                                  <Star className="w-3.5 h-3.5" /> Review
                                </Button>
                              </div>
                            )
                          )}
                          {reviewedOrderIds.has(order.id) && (
                            <p className="mt-3 text-xs text-green-600 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-green-500 text-green-500 animate-in zoom-in-50 duration-300" /> Reviewed!
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
