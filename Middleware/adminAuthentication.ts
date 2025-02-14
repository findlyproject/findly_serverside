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


const adminAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.adminToken;
        if (!token) {
             res.status(401).json({status:false, message: "Admin authentication token missing" });
             return
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
             res.status(500).json({status:false, message: "Server error: Secret key is missing" });
             return
        }

       const verifyToken = jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                 res.status(401).json({ status: false, message: "Invalid Admin Token", response: error });
                 return
            }

            req.user = user as JwtDecoded; 
            next();
        });
    } catch (error) {
        res.status(500).json({status:false, message: "Internal server error" });
    }
};

export { adminAuthentication };
