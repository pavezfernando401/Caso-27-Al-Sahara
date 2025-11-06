import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "alsahara_user",
    pass: process.env.DB_PASS || "",
    name: process.env.DB_NAME || "Alsahara"
  },
  jwtSecret: process.env.JWT_SECRET || "dev-secret"
};
