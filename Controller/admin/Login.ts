import { Request, Response } from "express"
import { Admin } from "../../Model/AdminSchema";
import  jwt  from "jsonwebtoken";
import User from "../../Model/UserSchema";


const login = async(req:Request,res:Response):Promise<void>=>{
    const {email,password} = req.body;

    if(!email || !password ){
        res.status(404).json({status:false,message:"email and password is missing"})
        return
    }
    const findAdmin = await Admin.findOne({email,password})
    if(!findAdmin){
        res.status(404).json({status:false,message:"Admin not fount login faild"})
        return
    }

    const adminToken = jwt.sign(
       
            { id: findAdmin._id, email: findAdmin.email },
            process.env.USER_SECRETKEY!,
            { expiresIn: "2d" }
          );
          res.cookie("adminToken", adminToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 2*24 * 60 * 60 * 1000,
          });

          res.status(200).json({status:true,message:"Admin login successful"})
    
}

/////////////////////// LOG OUT //////////////////

const logout = async (req:Request,res:Response):Promise<void>=>{

      res.clearCookie("adminToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
    }
      )
   
    res.status(200).json({status:true,message:"Admin logout sucssesfully"})

}

export = {
    login,
    logout,
    

}