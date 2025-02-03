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
  
    console.log("Subscription End Date:", subscriptionEndDate);
    
    if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
      const currentDate = new Date();
      console.log("Current Date:", currentDate);
  
     
      const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)); 
  
      const normalizedEndDate = startOfDay(subscriptionEndDate);
      const normalizedCurrentDate = startOfDay(currentDate);
  
      const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime(); 
      console.log("Time Difference:", differenceInTime);
  
      const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); 
  
      console.log("Remaining Days:", remainingValidityDays);


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

////////////////////////////// Log out //////////////////////

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
  
    console.log("Subscription End Date:", subscriptionEndDate);
    
    if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
      const currentDate = new Date();
      console.log("Current Date:", currentDate);
  
     
      const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0)); 
  
      const normalizedEndDate = startOfDay(subscriptionEndDate);
      const normalizedCurrentDate = startOfDay(currentDate);
  
      const differenceInTime = normalizedEndDate.getTime() - normalizedCurrentDate.getTime(); 
      console.log("Time Difference:", differenceInTime);
  
      const remainingValidityDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); 
  
      console.log("Remaining Days:", remainingValidityDays);


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
      console.error("Invalid subscription end date");
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

// Function to get People You Might Know based on followers and following
//  const getPeopleYouMightKnow = async (req: Request, res: Response): Promise<void> => {
  
//     const userId = req.user?.id;  // Assuming authentication middleware attaches user ID

//     // Validate that the user is authenticated
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//        res.status(400).json({ error: "Valid User ID is required" });
//        return
//     }

//     // Fetch the authenticated user's details including their followers and following
//     const user = await User.findById(userId).populate("followers following");

//     if (!user) {
//        res.status(404).json({ error: "User not found" });
//        return
//     }

//     // Get the list of potential users who are NOT in the user's following or followers list
//     const peopleYouMightKnow = await User.find({
//       _id: { $ne: userId }, // Exclude the current user
//       _id: { $nin: user.following?.map((follower) => follower._id) }, // Exclude users already followed
//       _id: { $nin: user.followers?.map((follower) => follower._id) }, // Exclude users who are already followers
//     }).populate("followers following");  // Optionally populate followers and following to find mutual connections

//     // Filter out users with mutual followers or following
//     const suggestedPeople = peopleYouMightKnow.filter((person) => {
//       // Find mutual followers
//       const mutualFollowers = user.followers?.filter((follower) =>
//         person.followers?.includes(follower._id)
//       );
//       // Find mutual followings
//       const mutualFollowing = user.following?.filter((following) =>
//         person.following?.includes(following._id)
//       );

//       // Suggest people with at least 1 mutual follower or mutual following
//        mutualFollowers.length > 0 || mutualFollowing.length > 0;
//     });

//      res.status(200).json({ suggestedPeople });
//      return
  
// };



export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id; // Assuming user ID comes from authentication middleware

  // Validate user ID
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: "Valid User ID is required" });
    return;
  }

  // Find the user by their ID
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

  // Prepare the update object dynamically
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
    ...(education && { education }), // Add education if provided
    ...(projects && { projects }),   // Add projects if provided
  };

  // Check and handle file uploads for profile image and cover image
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

  res.status(200).json({success:false, message: "Profile updated successfully", user: updatedUser });
};



export const uploadResume = async (req: Request, res: Response):Promise<void> => {

 
    const files = req.files as { resume: Express.Multer.File[] }; 
    const file = files?.resume ? files.resume[0] : null; 
    console.log("files",files)

    if (!file) {
       res.status(400).json({ success:false,message: "No file uploaded" });
       return
    }

    const fileUrl = file.path; 
    const fileName = file.originalname;
    const fileType = file.mimetype.startsWith("video") ? "Video" : "PDF";

    
    const userId = req.user?.id; 
    const user = await User.findById(userId);

    if (!user) {
       res.status(404).json({success:false, message: "User not found" });
       return
    }


    if (!user.resumePDF) {
      user.resumePDF = {
        fileUrl: "",
        fileName: "",
        uploadedAt: new Date(),
      };
    }

    if (!user.resumeVideo) {
      user.resumeVideo = {
        fileUrl: "",
        fileName: "",
        uploadedAt: new Date(),
      };
    }

   
    if (fileType === "PDF") {
      user.resumePDF = {
        fileUrl,
        fileName,
        uploadedAt: new Date(),
      };
    } else if (fileType === "Video") {
      user.resumeVideo = {
        fileUrl,
        fileName,
        uploadedAt: new Date(),
      };
    }

    await user.save(); 

     res.status(200).json({ message: "Resume uploaded successfully", user });

};



export{
  RegistrationUser,
  login,
  logout,
  findCurrentUserDetails,
  googleauthlogin,
  
}