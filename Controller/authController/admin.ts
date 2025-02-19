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

  res.status(200).json({ status: true, message: "Admin login successful" ,findAdmin});
};
// logout

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({ status: true, message: "Admin logout sucssesfully" });
};


//profile edit

export const ProfileEdit=async(req:Request,res:Response):Promise<void>=>{
  const {firstName,lastName,bio,phoneNumber,email,password}=req.body
  const adminId = req.user?.id ; 
    
    if (!adminId) {
      throw new CustomError("Admin ID is missing", 400);
    }

    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new CustomError("Admin not found", 404);
    }

    
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
   
    if (bio) admin.bio = bio;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
   
    if (req.file) {
      admin.profileImage = (req.file as any).path; // Cloudinary will return a URL in req.file.path
    }
if(email){
  admin.email=email
}
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save(); 

    res.status(200).json({ status: true, message: "Profile updated successfully", admin });


}
