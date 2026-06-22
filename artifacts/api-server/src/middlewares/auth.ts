import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";

export interface JwtPayload {
  id: number;
  role?: string;
  iat?: number;
  exp?: number;
}

function parseTokenFromCookie(header: string | undefined): string | null {
  if (!header) return null;
  const parts = header.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(COOKIE_NAME + "=")) return decodeURIComponent(p.split("=").slice(1).join("="));
  }
  return null;
}

export function attachUserFromCookie(req: Request, _res: Response, next: NextFunction): void {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // No secret configured; skip attaching user.
    next();
    return;
  }

  const cookieHeader = req.headers.cookie as string | undefined;
  const token = parseTokenFromCookie(cookieHeader);
  if (!token) { next(); return; }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (payload && payload.id) {
      // propagate user id to existing header-based checks
      req.headers["x-user-id"] = String(payload.id);
      // also attach user to request for direct usage
      (req as any).user = payload;
    }
  } catch (err) {
    // invalid token -> ignore
  }

  next();
}
