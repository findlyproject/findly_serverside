import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../Utils/errorHandler";

declare module "express-serve-static-core" {
    interface Request {
        company?: JwtDecoded;
        token?: string;
    }
}

export interface JwtDecoded extends JwtPayload {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
}


const companyAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.ctoken;
        if (!token) {
            res.status(401).json({status:false,message:"Authentication token missing"})
            return             
        }

        const secretKey = process.env.USER_SECRETKEY;
        if (!secretKey) {   
            throw new CustomError("missing secret key",404);
           
        }

        await jwt.verify(token, secretKey, (error, company) => {
            if (error) {
                throw new CustomError("Invalid token",401);
            }

            req.company = company as JwtDecoded; 
            next();
        });
    } catch (error) {
        res.status(400).json({status:false,message:"Internal server error"});
        return
    }
};

export { companyAuthMiddleware };
