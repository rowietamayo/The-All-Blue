import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useAdminListOrders, useListOrders } from "@workspace/api-client-react";
import { LogOut, Menu as MenuIcon, Shield, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function Nav() {
  const { count, openCart } = useCart();
  const { currentUser, logout, isAdmin } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const requestOpts = currentUser ? { headers: { "x-user-id": String(currentUser.id) } } : undefined;
  const { data: adminOrders } = useAdminListOrders(
    { request: requestOpts },
    // @ts-expect-error hook option not reflected in generated types
    { enabled: isAdmin }
  );
  const pendingCount = isAdmin
    ? (adminOrders?.filter(o => o.status === "pending").length ?? 0)
    : 0;

  const { data: userOrders } = useListOrders(
    { request: requestOpts },
    // @ts-expect-error hook option not reflected in generated types
    { enabled: !!currentUser }
  );

  const hasOrders = !!currentUser && Array.isArray(userOrders) && userOrders.length > 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home" onClick={() => setIsOpenMobile(false)}>
          <img src="https://ik.imagekit.io/8mmiwepdm/all-blue/fish-svgrepo-com.svg" alt="All Blue Logo" className="h-6 w-6 text-accent" />
          <span className="font-serif text-xl font-bold tracking-tight text-primary">All Blue</span>
        </Link>

        <div className="hidden md:flex gap-6">
          {!isAdmin &&(
            <>
              <Link href="/menu" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-menu">Menu</Link>
              <Link href="/chefs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-chefs">Chefs</Link>
              <Link href="/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-reviews">Reviews</Link>
            </>
          )}
          {hasOrders && !isAdmin && (
            <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-track">Track Order</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              data-testid="btn-open-cart"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center"
                  data-testid="cart-count-badge"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href={pendingCount > 0 ? "/admin?tab=orders" : "/admin"}
                  className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                  data-testid="link-admin"
                  title={pendingCount > 0 ? `${pendingCount} pending order${pendingCount > 1 ? "s" : ""}` : "Admin panel"}
                >
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-sm font-medium text-primary max-w-24 truncate" data-testid="text-current-user">
                    {currentUser.name ?? currentUser.phone}
                  </span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span className="text-sm font-medium text-primary max-w-24 truncate" data-testid="text-current-user">
                    {currentUser.name ?? currentUser.phone}
                  </span>
                </div>
              )}
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                title="Sign out"
                data-testid="btn-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors" data-testid="link-login">
              Sign In
            </Link>
          )}

          {!isAdmin && (
            <button
              onClick={() => setIsOpenMobile(v => !v)}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Toggle menu"
              data-testid="btn-toggle-mobile-menu"
            >
              {isOpenMobile ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {isOpenMobile && !isAdmin && (
        <div className="md:hidden border-t border-border/40 bg-background/98 px-6 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <Link
            href="/menu"
            onClick={() => setIsOpenMobile(false)}
            className="block text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-mobile-menu"
          >
            Menu
          </Link>
          <Link
            href="/chefs"
            onClick={() => setIsOpenMobile(false)}
            className="block text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-mobile-chefs"
          >
            Chefs
          </Link>
          <Link
            href="/reviews"
            onClick={() => setIsOpenMobile(false)}
            className="block text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-mobile-reviews"
          >
            Reviews
          </Link>
          {hasOrders && (
            <Link
              href="/track"
              onClick={() => setIsOpenMobile(false)}
              className="block text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-mobile-track"
            >
              Track Order
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <img src="https://ik.imagekit.io/8mmiwepdm/all-blue/fish-svgrepo-com.svg" alt="All Blue Logo" className="h-10 w-10 mx-auto mb-4 text-secondary" />
        <h3 className="font-serif text-2xl mb-2 text-secondary">Sanji's All Blue</h3>
        <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">Where the four seas meet on one plate.</p>
        <div className="flex justify-center gap-6 text-sm text-primary-foreground/60">
          <span>&copy; {new Date().getFullYear()} All Blue</span>
          <span>Grand Line</span>
        </div>
      </div>
    </footer>
  );
}
