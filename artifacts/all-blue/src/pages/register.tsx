import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading";
import { useToast } from "@/hooks/use-toast";
import { COUNTRY_CODES, getPhonePlaceholder } from "@/lib/country-codes";
import { useRegisterPhone } from "@workspace/api-client-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Register() {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+63");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const register = useRegisterPhone();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useAuth();
  const { withLoading } = useLoading();

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  const selected = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) {
      toast({ title: "Name and Phone required", variant: "destructive" });
      return;
    }

    const fullPhone = `${countryCode}${phone.replace(/^0+/, "")}`;

    withLoading(
      () =>
        new Promise<void>((resolve, reject) => {
          register.mutate(
            { data: { phone: fullPhone, name } },
            {
              onSuccess: (data) => {
                setCurrentUser({ ...data.user, name: data.user.name ?? null, createdAt: data.user.createdAt ?? "" });
                toast({ title: "Welcome aboard!" });
                setLocation("/");
                resolve();
              },
              onError: () => {
                toast({ title: "Registration failed", description: "This number may already be registered.", variant: "destructive" });
                reject();
              },
            }
          );
        }),
      "Setting sail..."
    );
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-8 border border-border bg-card rounded-2xl shadow-xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl font-bold text-primary mb-2">Join the Crew</h2>
          <p className="text-muted-foreground">Register to order from the four seas.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
            <Input
              type="text"
              placeholder="Captain..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-background focus-visible:ring-accent"
              data-testid="input-register-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(v => !v)}
                  className="flex items-center gap-1.5 px-3 h-9 border border-border rounded-md bg-background text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap"
                  data-testid="btn-country-code"
                >
                  <span>{selected.flag}</span>
                  <span className="text-muted-foreground">{selected.code}</span>
                  <span className="text-muted-foreground/50 text-xs">▼</span>
                </button>

                {showDropdown && (
                  <div className="absolute z-50 top-12 left-0 w-72 max-w-[calc(100vw-3.5rem)] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <Input
                        type="text"
                        placeholder="Search country..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 text-sm bg-background"
                        data-testid="input-country-search"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filtered.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setCountryCode(c.code); setShowDropdown(false); setSearch(""); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${countryCode === c.code ? "bg-accent/10 text-accent font-medium" : "text-foreground"}`}
                          data-testid={`option-country-${c.code}`}
                        >
                          <span>{c.flag}</span>
                          <span className="flex-1">{c.name}</span>
                          <span className="text-muted-foreground">{c.code}</span>
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-4">No countries found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Input
                type="tel"
                placeholder={getPhonePlaceholder(countryCode)}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-background focus-visible:ring-accent flex-1"
                data-testid="input-register-phone"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
            disabled={register.isPending}
            data-testid="btn-register-submit"
          >
            {register.isPending ? "Setting Sail..." : "Register"}
          </Button>
        </form>
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already a sailor? <Link href="/login" className="text-accent hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
