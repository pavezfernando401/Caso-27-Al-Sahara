import { pool } from "../db/mysql.js";

/**
 * GET /api/productos
 * Query: q, category, onlyAvailable (0/1), page=1, limit=12, featured=0/1
 */
export async function listar(req, res) {
  const { q, category, onlyAvailable, page = 1, limit = 12, featured } = req.query;
  const filters = [];
  const params = [];

  if (q) {
    filters.push("(nombre LIKE ? OR JSON_SEARCH(tags, 'one', ?) IS NOT NULL)");
    params.push(`%${q}%`, q);
  }
  if (category && category !== "all") {
    filters.push("category = ?");
    params.push(category);
  }
  if (onlyAvailable === "1") {
    filters.push("activo = 1");
  }
  if (featured === "1") {
    filters.push("featured = 1");
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const lim = Math.max(1, Math.min(100, Number(limit)));
  const pg = Math.max(1, Number(page));
  const offset = (pg - 1) * lim;

  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM productos ${where}`, params);
  const total = countRows[0].total;
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, valor AS price, imagen, activo AS available, category,
            JSON_EXTRACT(ingredients, '$') AS ingredients,
            JSON_EXTRACT(tags, '$') AS tags,
            featured
     FROM productos ${where}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...params, lim, offset]
  );

  res.json({ items: rows, total, page: pg, pages: Math.ceil(total / lim) });
}

export async function obtener(req, res) {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, valor AS price, imagen, activo AS available, category,
            JSON_EXTRACT(ingredients, '$') AS ingredients,
            JSON_EXTRACT(tags, '$') AS tags,
            featured
     FROM productos WHERE id=?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "No encontrado" });
  res.json(rows[0]);
}

// cajero/admin
export async function setDisponible(req, res) {
  const { available } = req.body; // 0/1
  if (![0,1,"0","1",true,false].includes(available)) {
    return res.status(400).json({ error: "available debe ser 0 o 1" });
  }
  const val = Number(available) ? 1 : 0;
  const [r] = await pool.query("UPDATE productos SET activo=? WHERE id=?", [val, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: "No encontrado" });
  const [rows] = await pool.query("SELECT id, activo AS available FROM productos WHERE id=?", [req.params.id]);
  res.json(rows[0]);
}
