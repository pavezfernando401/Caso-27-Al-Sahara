export const requireRole = (roles) => {
  const allow = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No auth" });
    if (!allow.includes(req.user.role)) return res.status(403).json({ error: "Sin permiso" });
    next();
  };
};
