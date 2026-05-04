import jwt from "jsonwebtoken";
import db from "./db.js";

export const protectedRoute = (req, res, next)=>{
  try {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({error: "No token, access denied"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {username: decoded.username};

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({error: "Invalid token"});
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({error: "No token, access denied"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute("SELECT is_admin FROM user WHERE username = ?", [decoded.username]);
    if (!rows[0]?.is_admin) return res.status(403).json({error: "Access denied"});

    req.user = {username: decoded.username};

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(401).json({error: "Invalid token"});
  }
};
