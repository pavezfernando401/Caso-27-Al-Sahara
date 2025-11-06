import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(token, config.jwtSecret); next(); }
  catch { return res.status(401).json({ error: "Token inválido" }); }
}
