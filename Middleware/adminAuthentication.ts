import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../Utils/errorHandler";

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


const adminAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.adminToken;
        if (!token) {
            throw new CustomError("Admin authentication token missing",401);
             
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
            throw new CustomError("missing secret key",404);
             
        }

       const verifyToken = jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                throw new CustomError("Invalid Admin Token",401);
            }

            req.user = user as JwtDecoded; 
            next();
        });
    } catch (error) {
        throw new CustomError("Error when validating data", 400);
    }
};

export { adminAuthentication };
