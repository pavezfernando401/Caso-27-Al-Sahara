import { Router } from "express";
import { login, logout, me, registerCliente } from "../controllers/auth.controller.js";
import { restoreSession } from "../middlewares/session.js";

const r = Router();
r.use(restoreSession);       // adjunta req.session si hay cookie válida
r.get("/me", me);
r.post("/login", login);
r.post("/logout", logout);
r.post("/register", registerCliente);

export default r;
