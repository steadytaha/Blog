import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { debugServer } from "../utils/debug.js";

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    // Validation is now handled by middleware

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ 
        username, 
        email, 
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.json("Signup success");
    } catch (error) {
        next(error);
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    // Validation is now handled by middleware

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, "User not found"));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, "Invalid password"));
        }
        const { password: hashedPassword, ...rest } = validUser._doc;
        const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin, role: validUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json(rest);
    } catch (error) {
        next(error);
    }
};

export const google = async (req, res, next) => {
    const { token } = req.body;
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const { email, name, picture } = decodedToken;

        const user = await User.findOne({ email });
        if (user) {
            const jwtToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            const { password, ...rest } = user._doc;
            res.status(200).cookie('token', jwtToken, { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }).json(rest);
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(36).slice(-4),
                email,
                password: hashedPassword,
                photo: picture,
                isAdmin: false
            });
            await newUser.save();
            const jwtToken = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            const { password, ...rest } = newUser._doc;
            res.status(200).cookie('token', jwtToken, { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }).json(rest);
        }
    } catch (error) {
        debugServer.error("Error with Google sign-in:", error);
        next(error);
    }
};