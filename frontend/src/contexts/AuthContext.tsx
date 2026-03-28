import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthResponseDto } from "../types/api";

interface AuthContextValue {
  auth: AuthResponseDto | null;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponseDto | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponseDto) : null;
  });

  const login = useCallback((data: AuthResponseDto) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  const isAdmin = auth?.roles.includes("Admin") ?? false;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
