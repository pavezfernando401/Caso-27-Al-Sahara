import { pool } from "../db/mysql.js";

async function ensureCarrito(userId){
  await pool.query("INSERT IGNORE INTO carritos (user_id) VALUES (?)", [userId]);
  const [[row]] = await pool.query("SELECT id FROM carritos WHERE user_id=?", [userId]);
  return row.id;
}

export async function addItem(req, res){
  if (!req.session) return res.status(401).json({ error: "No autenticado" });
  const { producto_id, cantidad = 1 } = req.body;
  if (!producto_id) return res.status(400).json({ error: "producto_id requerido" });

  const carritoId = await ensureCarrito(req.session.userId);

  // upsert cantidad
  await pool.query(`
    INSERT INTO carrito_items (carrito_id, producto_id, cantidad)
    VALUES (?,?,?)
    ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
  `, [carritoId, producto_id, cantidad]);

  res.status(201).json({ ok: true });
}

export async function getCarrito(req, res){
  if (!req.session) return res.status(401).json({ error: "No autenticado" });
  const carritoId = await ensureCarrito(req.session.userId);
  const [items] = await pool.query(`
    SELECT ci.id, ci.producto_id, ci.cantidad,
           p.nombre, p.valor AS price, p.imagen, p.activo AS available
    FROM carrito_items ci
    JOIN productos p ON p.id=ci.producto_id
    WHERE ci.carrito_id=?`, [carritoId]);
  res.json({ items });
}
