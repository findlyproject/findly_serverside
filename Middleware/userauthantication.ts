import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../Utils/errorHandler";
import { stat } from "fs";

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


const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.token;
        console.log("token",token);
        
        if (token=="undefined"||!token) {
            throw new CustomError("Authentication token missing",401);
             
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {   
            throw new CustomError("missing secret key",404);
           
        }

        await jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                throw new CustomError("Invalid token",401);
            }

            req.user = user as JwtDecoded; 
            next();
        });
    } catch (error) {
        res.status(400).json({status:false,message:"Internal server error"});
        return
    }
};

export { userAuthMiddleware };
