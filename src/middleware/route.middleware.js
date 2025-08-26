import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protectedRoute(req, res, next) {
    try {
        const authHeader = req.headers["authorization"]; // ✅ correct
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // format: "Bearer <token>"
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
}
