import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protectedRoute(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Invalid token format" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ check both possible fields
        const userId = decoded.id || decoded._id || decoded.userId;

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
}
