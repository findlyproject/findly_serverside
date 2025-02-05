import User from "../../Model/UserSchema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";import { string } from "zod";
import mongoose from "mongoose";
import multer, { Multer } from "multer";
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

////////////////////// LOGIN API ////////////////////////

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const logeduser = await User.findOne({ email });
  if (!logeduser) {
    res.status(404).json({ status: false, message: "email id is wrong" });
    return;
  }
  const verfyuser = await bcrypt.compare(password, logeduser.password);
  if (!verfyuser) {
    res.status(404).json({ status: false, message: "password is wrong" });
    return;
  }
  const currentDate = new Date();
  if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {
    if (logeduser.subscriptionEndDate < currentDate) {
      
      logeduser.role = "user";
      logeduser.subscriptionStartDate = null;
      logeduser.subscriptionEndDate = null;
      await logeduser.save();
    }
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



  if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {

    const subscriptionEndDate = logeduser.subscriptionEndDate
      ? new Date(logeduser.subscriptionEndDate)
      : null;
  
    
    if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
      const currentDate = new Date();
  
     
      const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)); 
  
      const normalizedEndDate = startOfDay(subscriptionEndDate);
      const normalizedCurrentDate = startOfDay(currentDate);
  
      const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime(); 
  
      const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); 
  


      if (remainingValidityDays > 0) {
        const payload = {
            userId: logeduser._id,
            email: logeduser.email,
            role: logeduser.role,
            remainingValidityDays,
        };

        const secretKey = process.env.USER_SECRETKEY!;

        const subscriptionToken = jwt.sign(payload, secretKey, {
            expiresIn: `${remainingValidityDays}d`,
        });

        res.cookie('subscriptionToken', subscriptionToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/', 
            maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
          });
    } else {
         res.status(403).json({
            success: false,
            message: "Your premium membership has expired. Please renew to continue enjoying premium benefits.",
        });
        return
    }
    } else {
      console.error("Invalid subscription end date");
    }
  }
  
  res
    .status(200)
    .json({ status: true, message: "Login successful", logeduser });
};

//////////////////////////////  LOGOUT //////////////////

const logout = async (req: Request, res: Response): Promise<void> => {


  const userId = req.user?.id;

  if (userId) {
    const user = await User.findById(userId);

    if (user && user.role === "premium" && user.subscriptionEndDate) {
      const currentDate = new Date();

      if (user.subscriptionEndDate < currentDate) {
        user.role = "user"; 
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
        await user.save();
      }
    }
  }

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

  res.clearCookie("subscriptionToken", {
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


    const currentDate = new Date();
    if (finduser.role === "premium" && finduser.subscriptionEndDate) {
      if (finduser.subscriptionEndDate < currentDate) {
        
        finduser.role = "user";
        finduser.subscriptionStartDate = null;
        finduser.subscriptionEndDate = null;
        await finduser.save();
      }
    }



    if (finduser.role === "premium" && finduser.subscriptionEndDate) {

    const subscriptionEndDate = finduser.subscriptionEndDate
      ? new Date(finduser.subscriptionEndDate)
      : null;
  
    
    if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
      const currentDate = new Date();
  
     
      const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)); 
  
      const normalizedEndDate = startOfDay(subscriptionEndDate);
      const normalizedCurrentDate = startOfDay(currentDate);
  
      const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime(); 
  
      const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); 
  


      if (remainingValidityDays > 0) {
        const payload = {
            userId: finduser._id,
            email: finduser.email,
            role: finduser.role,
            remainingValidityDays,
        };

        const secretKey = process.env.USER_SECRETKEY!;

        const subscriptionToken = jwt.sign(payload, secretKey, {
            expiresIn: `${remainingValidityDays}d`,
        });

        res.cookie('subscriptionToken', subscriptionToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/', 
            maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
          });
    } else {
         res.status(403).json({
            success: false,
            message: "Your premium membership has expired. Please renew to continue enjoying premium benefits.",
        });
        return
    }
    } else {
    }
  }
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
    res.status(200).json({status:true,message:"google auth Login successful",finduser})
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


  const currentUserDetails = await User.findById(userId).select("-password");

  if (!currentUserDetails) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({success:true,currentUserDetails});

}

//  get People You Might Know based on followers and following
export const getPeopleYouMightKnow = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Valid User ID is required" });
      return;
    }

    const user = await User.findById(userId).populate("connecting");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const potentialConnections = await User.find({
      _id: { 
        $ne: userId,
        $nin: user.connecting?.map((conn) => conn._id) || [] 
      }
    }).populate("connecting"); 

    const suggestedPeople = potentialConnections.filter((person) => {
      // Find mutual connections
      const mutualConnections = user.connecting?.filter((conn) =>
        person.connecting?.some((pConn) => pConn._id.equals(conn._id))
      );

      return mutualConnections.length > 0;
    });

    res.status(200).json({ suggestedPeople });
 
};



export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id; 

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: "Valid User ID is required" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    location,
    skills,
    jobTitle,
    jobLocation,
    about,
    education,
    projects,
  } = req.body;

  const updateData: { [key: string]: any } = {
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(email && { email }),
    ...(phoneNumber && { phoneNumber }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(location && { location }),
    ...(skills && { skills }),
    ...(jobTitle && { jobTitle }),
    ...(jobLocation && { jobLocation }),
    ...(about && { about }),
    ...(education && { education }), 
    ...(projects && { projects }),   
  };

  if (req.files && typeof req.files === "object") {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files["profileImage"] && Array.isArray(files["profileImage"])) {
      updateData.profileImage = files["profileImage"][0].path; 
    }

    if (files["banner"] && Array.isArray(files["banner"])) {
      updateData.banner = files["banner"][0].path; 
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!updatedUser) {
    res.status(500).json({ error: "Error updating user profile" });
    return;
  }

  res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
};

const AllUsers=async(req:Request,res:Response)=>{
  const { email } = req.query;
  const user = await User.findOne({ email });

  if (user) {
     res.json({ exists: true })
     return
  } else {
     res.json({ exists: false })
     return
  }
  
}
export{
  RegistrationUser,
  login,
  logout,
  findCurrentUserDetails,
  googleauthlogin,
  AllUsers
  
}