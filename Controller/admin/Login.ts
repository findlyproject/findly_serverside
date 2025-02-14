import { Request, Response } from "express";
import { Admin } from "../../model/AdminSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { CustomError } from "../../Utils/errorHandler";

//login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError("email and password is missing", 404);
  }
  const findAdmin = await Admin.findOne({ email });
  if (!findAdmin) {
    throw new CustomError("Admin not found", 404);
  }
  const isMatch = await bcrypt.compare(password, findAdmin.password);
  if (!isMatch) {
    throw new CustomError("password not match", 404);
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
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

          res.status(200).json({status:true,message:"Admin login successful"})
    
}
// logout

export const logout = async (req:Request,res:Response):Promise<void>=>{

      res.clearCookie("adminToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
    }
      )
   
    res.status(200).json({status:true,message:"Admin logout sucssesfully"})

}