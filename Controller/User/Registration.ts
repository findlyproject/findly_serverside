import User from "../../Model/UserSchema";
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken'


const RegistrationUser=async(req: Request, res: Response): Promise<void>=>{
const{email,password,firstName,lastName,education,jobTitles,jobLocations }=req.body
const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
     res.status(400).json({ message: "Invalid email format" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
     res.status(400).json({ message: "User already exists" });   
  }

  const hashedPassword = await bcrypt.hash(password, 10);
 const user= new User({email,password:hashedPassword,firstName,lastName,education,jobTitle:jobTitles,jobLocation:jobLocations })
 await user.save();

 const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.USER_SECRETKEY!,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.USER_SECRETKEY!,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

 res.cookie("user", user, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({message:'success',user})
}

////////////////////// Login api ////////////////////

const login = async (req:Request,res:Response): Promise<void>=>{
  const {email,password} = req.body
  const logeduser =await User.findOne({email})  
  console.log("logeduser",logeduser)
if(!logeduser){
   res.status(404).json({status:false,message:"email id is wrong"})
   return
}
    const verfyuser = await bcrypt.compare(password, logeduser.password);
    if(!verfyuser){
   res.status(404).json({status:false,message:"password is wrong"})
   return
    }
    if(verfyuser){
      const token = jwt.sign({ id: logeduser._id, email: logeduser.email},process.env.USER_SECRETKEY!,{ expiresIn: "1d" }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      const refreshToken = jwt.sign(
        { id: logeduser._id, email: logeduser.email },
        process.env.USER_SECRETKEY!,
        { expiresIn: "1d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
    
  }
  res.status(200).json({status:true,message:"Login successful",logeduser})

}

////////////////////////////// Log out //////////////////////

const logout = async (req:Request,res:Response): Promise<void>=>{
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ status: true, message: "Logout successfully" });
}


export{
  RegistrationUser,
  login,
  logout,
  
}