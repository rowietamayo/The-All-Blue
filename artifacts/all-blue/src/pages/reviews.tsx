import { useListReviews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Lock, ArrowRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Link } from "wouter";

export default function Reviews() {
  const { currentUser } = useAuth();
  const { data: reviews, isLoading } = useListReviews();

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-serif text-4xl text-primary mb-4">Customer Tales</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Stories from sailors and travelers across the four seas.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Review instructions / call-to-action — left column */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-serif text-xl text-primary mb-4">Leave a Tale</h3>

              {currentUser ? (
                <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif font-semibold text-base text-primary">Verified Reviews Only</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To ensure all customer tales are authentic, reviews can only be written for verified, delivered orders.
                    </p>
                  </div>
                  <Link href="/track">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mt-2" data-testid="btn-go-to-track">
                      Review Your Orders <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif font-semibold text-base text-primary">Join the Voyage</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Only registered crew members with delivered orders can share their tales.
                    </p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Link href="/login">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="btn-login-to-review">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" className="w-full" data-testid="btn-register-to-review">
                        Join the Crew
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews feed — right column */}
        <div className="md:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              No tales recorded yet. Be the first to share your experience!
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {(review.userName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary leading-none mb-0.5">{review.userName || "Anonymous Sailor"}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed text-sm md:text-base">"{review.comment}"</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
