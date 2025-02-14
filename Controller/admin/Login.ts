import { Request, Response } from "express"
import { Admin } from "../../model/AdminSchema";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"

//login
export const login = async(req:Request,res:Response):Promise<void>=>{
    const { email, password } = req.body;
    

    if(!email || !password ){
        res.status(404).json({status:false,message:"email and password is missing"})
        return
    }
    const findAdmin = await Admin.findOne({email})
    if(!findAdmin){
        res.status(404).json({status:false,message:"Admin not found"})
        return
    }
    const isMatch = await bcrypt.compare(password, findAdmin.password);
    if (!isMatch) {
      res.status(401).json({ status: false, message: "password not match" });
      return;
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

          res.status(200).json({status:"success",message:"Admin login successful"})
    
}
// logout

export const logout = async (req:Request,res:Response):Promise<void>=>{

      res.clearCookie("adminToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
    }
      )
   
    res.status(200).json({status:"success",message:"Admin logout sucssesfully"})

}