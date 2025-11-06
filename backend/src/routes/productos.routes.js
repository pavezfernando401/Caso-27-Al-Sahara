import { Router } from "express";
import { restoreSession } from "../middlewares/session.js";
import { requireRole } from "../middlewares/session.js";
import { listar, obtener, setDisponible } from "../controllers/productos.controller.js";

const r = Router();

r.use(restoreSession);

// público: listado y detalle
r.get("/", listar);
r.get("/:id", obtener);

// cajero/admin: marcar disponible/agotado
r.patch("/:id/available", requireRole(["cajero","admin"]), setDisponible);

export default r;
