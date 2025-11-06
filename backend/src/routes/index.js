import { Router } from "express";
import auth from "./auth.routes.js";
import productos from "./productos.routes.js";
import carrito from "./carrito.routes.js";

const router = Router();
router.get("/", (_req, res) => res.json({ api: "Al Sahara", version: "0.3" }));
router.use("/auth", auth);
router.use("/productos", productos);
router.use("/carrito", carrito);
export default router;
