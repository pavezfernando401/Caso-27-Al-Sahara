import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

/**
 * IMPORTANTE:
 * - Si usas Live Server en VSCode, suele servir en http://127.0.0.1:5500 o http://localhost:5500
 * - Agrega aquí los orígenes que uses para el FRONT.
 */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:3000",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, cb) => cb(null, origin ? allowedOrigins.includes(origin) : true),
  credentials: true, // 👈 necesario para cookies
}));

app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", routes);

export default app;
