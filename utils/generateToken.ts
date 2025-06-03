import jwt from "jsonwebtoken"
import express from "express"
import dotenv from "dotenv"

dotenv.config()


export const generateToken = (userId: string, res: express.Response) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });

    return token;
}