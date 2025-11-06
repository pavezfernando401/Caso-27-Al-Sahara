import app from "./app.js";
import { config } from "./config/index.js";
import { pool } from "./db/mysql.js";

(async () => {
  try {
    // probamos conexión a MySQL al iniciar
    const conn = await pool.getConnection();
    conn.release();
    console.log("✅ Conexión MySQL OK");
  } catch (e) {
    console.error("❌ Error MySQL:", e.message);
    console.error("Revisa tu .env y que la base exista en MySQL Workbench.");
    process.exit(1);
  }

  app.listen(config.port, () =>
    console.log(`🚀 API en http://localhost:${config.port}`)
  );
})();
