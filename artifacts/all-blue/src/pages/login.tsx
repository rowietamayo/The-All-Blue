import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading";
import { useToast } from "@/hooks/use-toast";
import { COUNTRY_CODES, getPhonePlaceholder } from "@/lib/country-codes";
import { useLoginPhone } from "@workspace/api-client-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [countryCode, setCountryCode] = useState("+63");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const login = useLoginPhone();
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
    if (!phone) {
      toast({ title: "Phone number required", variant: "destructive" });
      return;
    }

    const fullPhone = `${countryCode}${phone.replace(/^0+/, "")}`;

    withLoading(
      () =>
        new Promise<void>((resolve, reject) => {
          login.mutate(
            { data: { phone: fullPhone } },
            {
              onSuccess: (data) => {
                setCurrentUser({ ...data.user, name: data.user.name ?? null, createdAt: data.user.createdAt ?? "" });
                toast({ title: data.user.role === "admin" ? "Welcome Admin!" : `Welcome Sailor ${data.user.name}` });
                setLocation("/");
                resolve();
              },
              onError: () => {
                toast({ title: "Login failed", description: "Are you registered?", variant: "destructive" });
                reject();
              },
            }
          );
        }),
      "Checking the logbook..."
    );
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-8 border border-border bg-card rounded-2xl shadow-xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Enter your number to view your orders.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                data-testid="input-login-phone"
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg"
            disabled={login.isPending}
            data-testid="btn-login-submit"
          >
            {login.isPending ? "Docking..." : "Sign In"}
          </Button>
        </form>
        <p className="text-center mt-6 text-sm text-muted-foreground">
          New to the All Blue? <Link href="/register" className="text-accent hover:underline font-medium">Join the Crew</Link>
        </p>
      </div>
    </div>
  );
}
