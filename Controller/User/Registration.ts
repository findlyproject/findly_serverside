import User from "../../Model/UserSchema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";import { string } from "zod";


const RegistrationUser = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    firstName,
    lastName,
    education,
    jobTitles,
    jobLocations,
  } = req.body;
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    education,
    jobTitle: jobTitles,
    jobLocation: jobLocations,
  });
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

  res.status(200).json({ message: "success", user });
};

////////////////////// Login api ////////////////////

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const logeduser = await User.findOne({ email });
  console.log("logeduser", logeduser);
  if (!logeduser) {
    res.status(404).json({ status: false, message: "email id is wrong" });
    return;
  }
  const verfyuser = await bcrypt.compare(password, logeduser.password);
  if (!verfyuser) {
    res.status(404).json({ status: false, message: "password is wrong" });
    return;
  }
  if (verfyuser) {
    const token = jwt.sign(
      {
        id: logeduser._id,
        email: logeduser.email,
        isBlocked: logeduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
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
  res
    .status(200)
    .json({ status: true, message: "Login successful", logeduser });
};

////////////////////////////// Log out //////////////////////

const logout = async (req: Request, res: Response): Promise<void> => {
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
};

////////////////////// GOOGLE AUTH LOGIN /////////////////////

const googleauthlogin = async (req: Request, res: Response) => {
  const { email,name } = req.body;
  if(!name && !email){
    res.status(404).json({status:false,message:"name or email is missing"})
    return
  }
  const finduser = await User.findOne({ email });
  console.log("finduser",finduser);
  
  if (finduser) {
    const token = jwt.sign(
      {
        id: finduser._id,
        email: finduser.email,
        isBlocked: finduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const refreshToken = jwt.sign(
      {
        id: finduser._id,
        email: finduser.email,
        isBlocked: finduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({status:true,message:"google auth Login successful"})
    return
  }else{
    const user =await new User({
      email,
      firstName:name,
    });
    const savegoogleauth =await user.save()
    res.status(200).json({status:true,message:"google auth registration and Login successful",savegoogleauth})
  }
};



const findCurrentUserDetails=async( req:Request,res:Response):Promise<void>=>{

  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ message: "Unauthorized: No user ID found" });
    return;
  }

  console.log("User ID:", userId);

  const currentUserDetails = await User.findById(userId).select("-password");

  if (!currentUserDetails) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({success:true,currentUserDetails});

}




export{
  RegistrationUser,
  login,
  logout,
  findCurrentUserDetails,
  googleauthlogin
}