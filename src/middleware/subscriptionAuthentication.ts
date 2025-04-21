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


const subscriptionAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.subscriptionToken;
        if (!token) {
            throw new CustomError("subscriptionToken token missing",401)

        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
            throw new CustomError(" subscription Secret key is missing",500)
 
        }

       const a = jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                throw new CustomError(`Invalid token ${error}`,401)

            }

            req.user = user as JwtDecoded; 
            next();
        });
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { subscriptionAuthentication  };
