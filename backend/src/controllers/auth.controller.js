import { pool } from "../db/mysql.js";
import bcrypt from "bcrypt";
import { createSession, destroySession, setSessionCookie } from "../middlewares/session.js";

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email y password requeridos" });

  const [urows] = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.pass_hash, r.nombre AS role
     FROM usuarios u
     JOIN roles r ON r.id=u.role_id
     WHERE u.email=?`, [email]
  );
  if (!urows.length) return res.status(401).json({ error: "Credenciales inválidas" });

  const user = urows[0];
  const ok = await bcrypt.compare(password, user.pass_hash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const sid = await createSession(user.id);
  setSessionCookie(res, sid);

  res.json({ user: { id: user.id, name: user.nombre, email: user.email, role: user.role } });
}

export async function me(req, res) {
  if (!req.session) return res.json({ user: null });
  res.json({ user: { id: req.session.userId, name: req.session.name, email: req.session.email, role: req.session.role } });
}

export async function logout(req, res) {
  const sid = req.cookies?.sid;
  if (sid) await destroySession(sid);
  res.clearCookie("sid", { path: "/" });
  res.json({ ok: true });
}

export async function registerCliente(req, res) {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: "faltan campos" });

  const [exist] = await pool.query("SELECT id FROM usuarios WHERE email=?", [email]);
  if (exist.length) return res.status(409).json({ error: "email ya registrado" });

  const [[role]] = await pool.query("SELECT id FROM roles WHERE nombre='cliente'");
  const hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query(
    "INSERT INTO usuarios (nombre,email,pass_hash,role_id) VALUES (?,?,?,?)",
    [nombre, email, hash, role.id]
  );

  await pool.query("INSERT IGNORE INTO carritos (user_id) VALUES (?)", [r.insertId]);
  res.status(201).json({ ok: true });
}
