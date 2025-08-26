import jwt from 'jsonwebtoken';
import User from "../models/User.js";


const protectRoute = async (req,res,next)=>{

    try {
        //get token
        const token = req.headers["Authorization"].replace("Bearer ", "");

        if(!token) return res.status(403).json({message:"You are not authorized, access denied"});

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const user = await User.findById(decodedToken.userId).select("-password");

        if(!user) return res.status(401).json({message:"Token not found"});

        req.user = user;
        next();
    }catch(errors){
        console.error("Authentication error:", errors.message);
        res.status(401).json({ message: "Token is not valid" });
    }

}

export default protectRoute;