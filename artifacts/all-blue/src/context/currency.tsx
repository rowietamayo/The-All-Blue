import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { getCurrencyFromPhone, formatPrice as baseFormatPrice } from "@/lib/currency";

interface CurrencyContextValue {
  currency: string;
  rate: number;
  formatPrice: (usdPrice: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const SESSION_STORAGE_KEY = "all_blue_exchange_rates";

interface ExchangeRateResponse {
  result: string;
  rates: Record<string, number>;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Derive target currency based on user phone or default to USD
  const currency = currentUser ? getCurrencyFromPhone(currentUser.phone) : "USD";
  const rate = rates[currency] ?? 1;

  useEffect(() => {
    async function fetchRates() {
      try {
        // Try loading from session storage first
        const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as Record<string, number>;
          if (parsed && parsed.USD === 1) {
            setRates(parsed);
            setIsLoading(false);
            return;
          }
        }

        // Fetch from API
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("Failed to fetch exchange rates");
        const data = (await res.json()) as ExchangeRateResponse;
        if (data.result === "success" && data.rates) {
          setRates(data.rates);
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.rates));
        }
      } catch (err) {
        console.error("Failed to load exchange rates, falling back to USD:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRates();
  }, []);

  const formatPrice = (usdPrice: number) => {
    return baseFormatPrice(usdPrice, currency, rate);
  };

  return (
    <CurrencyContext.Provider value={{ currency, rate, formatPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrencyContext must be used within CurrencyProvider");
  return ctx;
}
