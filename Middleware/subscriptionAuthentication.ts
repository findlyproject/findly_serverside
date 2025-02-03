import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
             res.status(401).json({ message: "subscriptionToken token missing" });
             return
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
             res.status(500).json({ message: "Server error: subscription Secret key is missing" });
             return
        }

       const a = jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                 res.status(401).json({ status: false, message: "Invalid token", response: error });
                 return
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
