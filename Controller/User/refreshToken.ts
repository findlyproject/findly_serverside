import { Request, Response } from "express";
import { stat } from "fs";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { CustomError } from "../../Utils/errorHandler";

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
        throw new CustomError("Refresh token not found please login",404);
        
    }
    const secretKey = process.env.USER_SECRETKEY || "default_secret";
if(!secretKey){
    throw new CustomError("missing secret key",404);
}
jwt.verify(refreshToken, secretKey, (error: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (error) {
            throw new CustomError("Refresh token invalid",404);
            
        }
        if (typeof decoded !== "object" || !decoded) {
            throw new CustomError("Invalid token structure",404);
            
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

         res.status(200).json({status:true,message:"accessToken created", accessToken });
         return
    });
};

export { refreshAccessToken };