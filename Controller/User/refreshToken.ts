import { Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtDecoded;
        token?: string;
    }
}

export interface JwtDecoded extends JwtPayload {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
}

const refreshAccessToken = async (req:Request, res:Response):Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
         res.status(404).json({ message: "Refresh token not found please login" });
         return
    }
    const secretKey = process.env.USER_SECRETKEY || "default_secret";
if(!secretKey){
    res.status(404).json({ message: "missing secret key" });
             return
}
jwt.verify(refreshToken, secretKey, (error: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (error) {
            res.status(404).json({ message: "Refresh token invalid" });
             return
        }
        if (typeof decoded !== "object" || !decoded) {
            res.status(400).json({ message: "Invalid token structure" });
            return;
        }

        const accessToken = jwt.sign(
        { id: decoded.id, username: decoded.username, email: decoded.email },
        secretKey,
        { expiresIn: "1d" }
        );

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

         res.status(200).json({message:"accessToken created", accessToken });
         return
    });
};

export { refreshAccessToken };