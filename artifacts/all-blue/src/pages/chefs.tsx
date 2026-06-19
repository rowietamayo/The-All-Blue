import { Card, CardContent } from "@/components/ui/card";
import { useListChefs } from "@workspace/api-client-react";


export default function Chefs() {
  const { data: chefs, isLoading } = useListChefs();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="font-serif text-4xl text-primary mb-4">Our Master Chefs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">The brilliant minds bringing the All Blue to life.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse flex flex-col sm:flex-row overflow-hidden">
              <div className="w-full sm:w-1/2 h-64 bg-muted" />
              <CardContent className="p-6 space-y-3 w-full sm:w-1/2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !Array.isArray(chefs) || chefs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <h3 className="text-xl font-serif text-primary mb-2">No chefs found</h3>
          <p className="text-muted-foreground">The crew is currently out at sea gathering ingredients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {chefs.map((chef) => (
            <Card key={chef.id} className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-shadow group">
              {chef.imageUrl ? (
                <div className="w-full sm:w-1/2 h-64 sm:h-auto overflow-hidden">
                  <img src={chef.imageUrl} alt={chef.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-full sm:w-1/2 h-64 sm:h-auto bg-secondary/50 flex items-center justify-center">
                  <span className="text-primary font-serif italic text-lg">{chef.name}</span>
                </div>
              )}
              <CardContent className="p-6 w-full sm:w-1/2 flex flex-col justify-center">
                  <h3 className="font-serif text-2xl font-bold text-primary mb-1">{chef.name}</h3>
                  <p className="text-accent font-medium mb-3">{chef.specialty}</p>
                  {chef.yearsExperience != null && chef.yearsExperience > 0 && (
                    <div className="relative group inline-block mb-3">
                    <span className="bg-muted text-black text-xs px-2 py-1 rounded-full cursor-pointer">
                        {chef.yearsExperience} yrs expert
                    </span>
                  </div>
                  )}
                  <p className="text-muted-foreground text-sm line-clamp-4">{chef.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
