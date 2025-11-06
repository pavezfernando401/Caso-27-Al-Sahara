import crypto from "crypto";
import { pool } from "../db/mysql.js";

const SESSION_TTL_HOURS = 8;

export function setSessionCookie(res, sid) {
  res.cookie("sid", sid, {
    httpOnly: true,
    sameSite: "lax", // permite en sitios del mismo origen/localhost
    secure: false,   // pon true si usas HTTPS real
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000
  });
}

export async function createSession(userId) {
  const sid = crypto.randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO sessions (id,user_id,expires_at) VALUES (?,?,DATE_ADD(NOW(), INTERVAL ? HOUR))",
    [sid, userId, SESSION_TTL_HOURS]
  );
  return sid;
}

export async function destroySession(sid) {
  await pool.query("DELETE FROM sessions WHERE id=?", [sid]);
}

export async function restoreSession(req, _res, next) {
  const sid = req.cookies?.sid;
  if (!sid) { req.session = null; return next(); }
  const [rows] = await pool.query(
    `SELECT s.id, s.user_id, u.nombre, u.email, r.nombre AS role
     FROM sessions s
     JOIN usuarios u ON u.id=s.user_id
     JOIN roles r ON r.id=u.role_id
     WHERE s.id=? AND s.expires_at>NOW()`,
    [sid]
  );
  if (!rows.length) { req.session = null; return next(); }
  req.session = {
    sid: rows[0].id,
    userId: rows[0].user_id,
    name: rows[0].nombre,
    email: rows[0].email,
    role: rows[0].role
  };
  next();
}

export function requireSession(_req, res, next) {
  // restoreSession debe correr antes (en rutas)
  // si no hay session, devolvemos 401
  return next();
}

export function requireRole(roles) {
  const allow = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.session) return res.status(401).json({ error: "No autenticado" });
    if (!allow.includes(req.session.role)) return res.status(403).json({ error: "Sin permiso" });
    next();
  };
}
