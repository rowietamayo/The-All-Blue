import { useState } from "react";
import { useCart } from "@/context/cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Anchor } from "lucide-react";
import { useLocation } from "wouter";
import { DeliveryMap, type DeliveryAddress } from "@/components/delivery-map";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading";

type Step = "cart" | "delivery";

const emptyAddress: DeliveryAddress = {
  building: "",
  street: "",
  city: "",
  zipCode: "",
  lat: null,
  lng: null,
  formatted: "",
};

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, total, isOpen, closeCart } = useCart();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<Step>("cart");
  const [address, setAddress] = useState<DeliveryAddress>(emptyAddress);

  const requestOpts = currentUser
    ? { headers: { "x-user-id": String(currentUser.id) } }
    : undefined;
  const createOrder = useCreateOrder({ request: requestOpts });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { withLoading } = useLoading();

  const originLabel: Record<string, string> = {
    north_blue: "North Blue",
    south_blue: "South Blue",
    east_blue: "East Blue",
    west_blue: "West Blue",
  };

  const isAddressComplete = address.street.trim() && address.city.trim();

  const handlePlaceOrder = () => {
    if (!isAddressComplete) {
      toast({ title: "Street and city are required", variant: "destructive" });
      return;
    }

    const fullAddress = address.formatted || [address.building, address.street, address.city, address.zipCode].filter(Boolean).join(", ");

    withLoading(
      () =>
        new Promise<void>((resolve, reject) => {
          createOrder.mutate(
            {
              data: {
                deliveryAddress: fullAddress,
                deliveryLat: address.lat ?? undefined,
                deliveryLng: address.lng ?? undefined,
                items: items.map(i => ({
                  menuItemId: i.menuItemId,
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                })),
              },
            },
            {
              onSuccess: () => {
                clearCart();
                closeCart();
                setStep("cart");
                setAddress(emptyAddress);
                toast({ title: "Order placed! Bon appetit, sailor." });
                setLocation("/track");
                resolve();
              },
              onError: () => {
                toast({ title: "Failed to place order", description: "Please try again.", variant: "destructive" });
                reject();
              },
            }
          );
        }),
      "Preparing your order..."
    );
  };

  const handleClose = () => {
    closeCart();
    setStep("cart");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        data-testid="cart-overlay"
      />

      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-2xl text-primary">
              {step === "cart" ? "Your Order" : "Delivery Details"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            data-testid="btn-close-cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1 — Cart */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Anchor className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="font-serif text-xl text-primary/60 mb-1">The galley is empty</p>
                  <p className="text-sm text-muted-foreground">Add dishes from the menu to get started.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.menuItemId} className="flex gap-4 p-4 bg-background rounded-xl border border-border" data-testid={`cart-item-${item.menuItemId}`}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-primary text-sm leading-tight mb-0.5 truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{originLabel[item.origin] ?? item.origin}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            data-testid={`btn-decrease-${item.menuItemId}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium" data-testid={`qty-${item.menuItemId}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            data-testid={`btn-increase-${item.menuItemId}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="self-start p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                      data-testid={`btn-remove-${item.menuItemId}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-accent font-serif text-xl" data-testid="cart-total">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base font-medium shadow-md"
                  onClick={() => {
                    if (!currentUser) {
                      closeCart();
                      setLocation("/login");
                      toast({ title: "Please sign in to place an order", description: "You must be logged in to order." });
                    } else {
                      setStep("delivery");
                    }
                  }}
                  data-testid="btn-proceed-delivery"
                >
                  Proceed to Delivery
                </Button>
              </div>
            )}
          </>
        )}

        {/* STEP 2 — Delivery */}
        {step === "delivery" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Order summary */}
              <div className="bg-background rounded-xl border border-border p-4 space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Order Summary</p>
                {items.map(item => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                    <span className="text-accent font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-border flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-accent">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Address + Map */}
              <div>
                <p className="text-sm font-semibold text-primary mb-3">Delivery Address</p>
                <DeliveryMap value={address} onChange={setAddress} />
              </div>
            </div>

            <div className="px-6 py-5 border-t border-border space-y-3">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base font-medium shadow-md"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || !isAddressComplete}
                data-testid="btn-place-order"
              >
                {createOrder.isPending ? "Setting Sail..." : `Place Order — $${total.toFixed(2)}`}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setStep("cart")}
                data-testid="btn-back-to-cart"
              >
                Back to Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
