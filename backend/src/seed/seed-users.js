import bcrypt from "bcrypt";
import { pool } from "../db/mysql.js";

async function getRoleId(nombre) {
  const [rows] = await pool.query("SELECT id FROM roles WHERE nombre = ?", [nombre]);
  if (!rows.length) throw new Error(`Rol no existe: ${nombre}`);
  return rows[0].id;
}

async function upsertUser({ nombre, email, pass, role }) {
  const roleId = await getRoleId(role);
  const hash = await bcrypt.hash(pass, 10);
  await pool.query(`
    INSERT INTO usuarios (nombre, email, pass_hash, role_id)
    VALUES (?,?,?,?)
    ON DUPLICATE KEY UPDATE pass_hash=VALUES(pass_hash), role_id=VALUES(role_id)
  `, [nombre, email, hash, roleId]);
}

(async () => {
  try {
    await upsertUser({ nombre: "Cliente Demo", email: "correo@example.com", pass: "Elpepe2025", role: "cliente" });
    await upsertUser({ nombre: "Admin",        email: "admin@alsahara.cl",  pass: "Admin2025",  role: "admin" });
    await upsertUser({ nombre: "Cajero",       email: "cajero@alsahara.cl", pass: "Cajero2025", role: "cajero" });
    console.log("✅ Seed de usuarios listo");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed falló:", e.message);
    process.exit(1);
  }
})();
