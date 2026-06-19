import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { MenuItemOrigin, useGetDashboardStats, useGetPopularItems, useListOrders } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Home() {
  const { data: stats } = useGetDashboardStats();
  const { data: popularItems, isLoading: loadingPopular } = useGetPopularItems();
  const { currentUser, isAdmin } = useAuth();

  const requestOpts = currentUser ? { headers: { "x-user-id": String(currentUser.id) } } : undefined;
  const { data: userOrders } = useListOrders(
    { request: requestOpts },
    // @ts-expect-error hook option not reflected in generated types
    { enabled: !!currentUser }
  );
  const hasOrders = !!currentUser && Array.isArray(userOrders) && userOrders.length > 0;

  const getOriginColor = (origin: MenuItemOrigin) => {
    switch (origin) {
      case "north_blue": return "bg-blue-100 text-blue-800 border-blue-200";
      case "south_blue": return "bg-green-100 text-green-800 border-green-200";
      case "east_blue": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "west_blue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatOrigin = (origin: string) => origin.replace("_", " ").toUpperCase();

  return (
    <div className="flex-1 flex flex-col w-full animate-in fade-in duration-700">
      <section className="relative h-[80vh] flex items-center justify-center bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.rwsentosa.com/-/jssmedia/project/dine/ocean-restaurant/new-design/masthead-mobile.png?h=1350&iar=0&w=1080&rev=0b7a7b7751624f0b932340f51af85631&sc_lang=en&hash=C137FB610F7EC8BE400319C98B2ED35E')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-4 block">The Legendary Ocean</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">Where the Four Seas Meet</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Experience the culinary dream of the seafarer. Dishes crafted from the finest ingredients of the North, South, East, and West Blue.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 shadow-lg transition-transform hover:scale-105" data-testid="hero-btn-menu">
                Explore the Menu
              </Button>
            </Link>
            {hasOrders && !isAdmin && (
              <Link href="/track">
                <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-full px-8 shadow-lg transition-transform hover:scale-105" data-testid="hero-btn-track">
                  Track Order
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
              <div className="animate-in fade-in zoom-in duration-500 delay-100">
                <p className="text-4xl font-serif text-accent mb-2" data-testid="stat-menu-items">{stats.totalMenuItems}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Legendary Dishes</p>
              </div>
              <div className="animate-in fade-in zoom-in duration-500 delay-200">
                <p className="text-4xl font-serif text-accent mb-2" data-testid="stat-chefs">{stats.totalChefs}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Master Chefs</p>
              </div>
              <div className="animate-in fade-in zoom-in duration-500 delay-300">
                <p className="text-4xl font-serif text-accent mb-2" data-testid="stat-rating">{(Number(stats.averageRating) || 0).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Star Rating</p>
              </div>
              <div className="animate-in fade-in zoom-in duration-500 delay-400">
                <p className="text-4xl font-serif text-accent mb-2" data-testid="stat-orders">{stats.totalOrders}+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Happy Sailors</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-primary mb-4">Legendary Favorites</h2>
            <p className="text-muted-foreground">The most sought-after treasures of the sea.</p>
          </div>

          {loadingPopular ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse border-border/50">
                  <div className="h-56 bg-muted rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.isArray(popularItems) && popularItems.slice(0, 3).map((item, i) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 group bg-card"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {item.imageUrl ? (
                    <div className="h-56 overflow-hidden relative">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`shadow-md border ${getOriginColor(item.origin)}`}>
                          {formatOrigin(item.origin)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 bg-secondary/20 flex items-center justify-center relative">
                      <span className="text-primary font-serif italic text-xl opacity-50">{item.name}</span>
                      <div className="absolute top-3 right-3">
                        <Badge className={`shadow-md border ${getOriginColor(item.origin)}`}>
                          {formatOrigin(item.origin)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-2xl font-bold text-primary">{item.name}</h3>
                      <span className="font-medium text-accent text-lg">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-8 shadow-md">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
