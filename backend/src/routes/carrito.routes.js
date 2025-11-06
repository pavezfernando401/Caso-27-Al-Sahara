import { Router } from "express";
import { restoreSession } from "../middlewares/session.js";
import { addItem, getCarrito } from "../controllers/carrito.controller.js";

const r = Router();
r.use(restoreSession);
r.get("/", getCarrito);
r.post("/items", addItem);
export default r;
