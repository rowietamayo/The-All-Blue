import { useState, useEffect } from "react";
import { useListMenuItems, useListCategories, MenuItemOrigin } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Check, ShieldAlert, Star } from "lucide-react";
import { useCart } from "@/context/cart";
import { useAuth } from "@/context/auth";
import { useCurrency } from "@/hooks/use-currency";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Menu() {
  const [activeOrigin, setActiveOrigin] = useState<MenuItemOrigin | "all">("all");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const { addItem } = useCart();
  const { isAdmin } = useAuth();
  const { formatPrice } = useCurrency();

  const debouncedSearch = useDebounce(search, 250);

  const { data: categories } = useListCategories();

  const { data: items, isLoading } = useListMenuItems({
    origin: activeOrigin !== "all" ? activeOrigin : undefined,
    category: activeCategory !== "all" ? activeCategory : undefined,
    search: debouncedSearch || undefined,
  });

  const sortedItems = items
    ? [...items].sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating-desc") {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        }
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      })
    : [];

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

  const origins: { id: MenuItemOrigin | "all"; label: string }[] = [
    { id: "all", label: "All Seas" },
    { id: "north_blue", label: "North Blue" },
    { id: "south_blue", label: "South Blue" },
    { id: "east_blue", label: "East Blue" },
    { id: "west_blue", label: "West Blue" },
  ];

  const handleAddToCart = (item: NonNullable<typeof items>[number]) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      origin: item.origin,
    });
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">The Grand Menu</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Discover the finest ingredients gathered from every corner of the world.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center bg-card/30 border border-border/50 rounded-2xl p-6 shadow-sm animate-in fade-in duration-500">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            className="pl-9 bg-background border-border focus-visible:ring-accent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-menu-search"
          />
        </div>

        {/* Filters and Sort group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Sea origin dropdown */}
          <div className="w-full sm:w-44">
            <Select value={activeOrigin} onValueChange={(val) => setActiveOrigin(val as MenuItemOrigin | "all")}>
              <SelectTrigger className="w-full bg-background border-border" data-testid="select-menu-origin">
                <SelectValue placeholder="All Seas" />
              </SelectTrigger>
              <SelectContent>
                {origins.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category dropdown */}
          <div className="w-full sm:w-44">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-full bg-background border-border" data-testid="select-menu-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort dropdown */}
          <div className="w-full sm:w-44">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-background border-border" data-testid="select-menu-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Featured / Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Top Rated</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse border-border/50">
              <div className="h-56 bg-muted rounded-t-lg" />
              <CardContent className="p-6 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !Array.isArray(sortedItems) || sortedItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <h3 className="text-xl font-serif text-primary mb-2">No dishes found</h3>
          <p className="text-muted-foreground">Try adjusting your search or origin filter.</p>
          <Button
            variant="outline"
            className="mt-4 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => {
              setActiveOrigin("all");
              setActiveCategory("all");
              setSearch("");
              setSortBy("default");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedItems.map((item, i) => {
            const added = addedIds.has(item.id);
            return (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 group flex flex-col h-full bg-card"
                style={{ animationDelay: `${i * 50}ms` }}
                data-testid={`card-menu-${item.id}`}
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
                  <div className="h-56 bg-secondary/20 flex flex-col items-center justify-center relative">
                    <span className="text-primary font-serif italic text-xl opacity-50">{item.name}</span>
                    <div className="absolute top-3 right-3">
                      <Badge className={`shadow-md border ${getOriginColor(item.origin)}`}>
                        {formatOrigin(item.origin)}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-serif text-2xl font-bold text-primary leading-tight">{item.name}</h3>
                    <span className="font-medium text-accent text-lg">{formatPrice(item.price)}</span>
                  </div>

                  {/* Rating display */}
                  {item.rating !== undefined && item.rating !== null ? (
                    <div className="flex items-center gap-1.5 mb-3 text-sm" data-testid={`card-rating-${item.id}`}>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      </div>
                      <span className="font-medium text-foreground/85">{(Number(item.rating) || 0).toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">({item.reviewCount ?? 0} {item.reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground/45" data-testid={`card-rating-${item.id}`}>
                      <Star className="w-3.5 h-3.5 text-muted-foreground/30" />
                      <span className="text-xs italic">No reviews yet</span>
                    </div>
                  )}

                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-1">{item.description}</p>
                  {isAdmin ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-muted text-muted-foreground text-sm font-medium border border-border/50 cursor-not-allowed select-none">
                      <ShieldAlert className="w-4 h-4" />
                      Admin View
                    </div>
                  ) : (
                    <Button
                      className={`w-full font-medium shadow-sm transition-all active:scale-[0.98] ${
                        added
                          ? "bg-green-600 hover:bg-green-600 text-white"
                          : "bg-accent hover:bg-accent/90 text-accent-foreground"
                      }`}
                      onClick={() => handleAddToCart(item)}
                      data-testid={`btn-add-to-cart-${item.id}`}
                    >
                      {added ? (
                        <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Added</span>
                      ) : (
                        <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add to Order</span>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
