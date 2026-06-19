import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  phone: string;
  name: string | null;
  role: "customer" | "admin";
  createdAt: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const STORAGE_KEY = "all_blue_user";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(loadUser);

  const setCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser]);

  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
