import express from 'express';
import "dotenv/config";

import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();

const generateToken = (userId)=>{
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'});
}


router.post('/register',async  (req,res)=>{
    try {
        const { email, username, password } = req.body;

        if(!email || !username || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        if(password.length<6) return res.status(400).json({message:"Password must be at least 6 characters"});

        if(username.length<3) return res.status(400).json({message:"Username must be at least 3 characters"});

        const checkExistingEmail = await User.findOne({ email });

        if(checkExistingEmail){
            return res.status(400).json({message:"User already exists"});
        }

        // get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            }
        });

    }catch(error){
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


router.post('/login',async  (req,res)=>{
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        const existUser = await User.findOne({email});

        if(!existUser) return res.status(400).json({message:"Invalid Credentials"});

        const isCorrectPassword = await existUser.comparePassword(password);

        if(!isCorrectPassword) return res.status(400).json({message:"Invalid Credentials"});

        const token = generateToken(existUser._id);

        res.status(200).json({
            token,
            user:{
                id:existUser._id,
                username:existUser.username,
                email:existUser.email,
                profileImage:existUser.profileImage,
                createdAt:existUser.createdAt,
            }

        });

    }catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
