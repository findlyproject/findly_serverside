import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtPayload | string;
        token?: string;
    }
}
export interface CustomRequest extends Request {
	user?: {
		id: string;
	} & JwtPayload;
}

export type JwtDecoded = {
	id: string;
	iat: number;
	exp: number;
	role: "user" | "admin";
};

const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Authentication token missing" });
            return;
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {
            res.status(500).json({ message: "Server error: Secret key is missing" });
            return;
        }

        jwt.verify(token, secretKey, (error, user) => {
            if (error) {
                res.status(401).json({ status: false, message: "Invalid token", response: error });
                return;
            }

            req.user = user as JwtDecoded;
            next();
        });
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { userAuthMiddleware };
