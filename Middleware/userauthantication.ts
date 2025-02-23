import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../Utils/errorHandler";
import { companyAuthMiddleware } from "./companyAuthentication";

declare module "express-serve-static-core" {
    interface Request {
        users?: JwtDecoded;
        token?: string;
    }
}

export interface JwtDecoded extends JwtPayload {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
    type:string
}


const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token: string | undefined = req.cookies?.token;
        console.log("token",token);
        if (!token) {
            console.log("token",token);
            

        //    await companyAuthMiddleware(req, res, next);  
        //    return; 
            res.status(401).json({status:false,message:"Authentication token missing"})
            return             
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


const companyAuth=(req:Request,res:Response,next:NextFunction):void=>{
    console.log('Admin auth middleware');
    userAuthMiddleware(req,res,()=>{
       
        
        if(req.user &&req.user.type=='Company'){
            console.log("req",req.user);
            
            return next()
        }else{
            console.log(req.user);
            return next(new CustomError('You are not authorized', 403));
        }
    })
    
}


const userAuth=(req:Request,res:Response,next:NextFunction):void=>{
    console.log('user auth middleware');
    userAuthMiddleware(req,res,()=>{
    
       
        
        if(req.user &&req.user.type=='User'){
            console.log("req",req.user);
            
            return next()
        }else{
            console.log(req.user);
            console.log(req.user &&req.user.type=='User');
            return next(new CustomError('You are not authorized', 403));
        }
    })
    
}


export { userAuthMiddleware,companyAuth,userAuth };
