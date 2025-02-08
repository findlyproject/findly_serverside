import User from "../../Model/UserSchema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";import { string } from "zod";
import mongoose from "mongoose";
import multer, { Multer } from "multer";
import { IUser } from "../../types/allTypes";

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

export const getPeopleYouMightKnow = async (req: Request, res: Response): Promise<void> => {
    // const userId = req.user?.id;

    // if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    //   res.status(400).json({ error: "Valid User ID is required" });
    //   return;
    // }

    // const user = await User.findById(userId).populate("connecting");

    // if (!user) {
    //   res.status(404).json({ error: "User not found" });
    //   return;
    // }

    // const potentialConnections = await User.find({
    //   _id: { 
    //     $ne: userId,
    //     $nin: user.connecting?.map((conn) => conn._id) || [] 
    //   }
    // }).populate("connecting"); 

    // const suggestedPeople = potentialConnections.filter((person) => {
    //   // Find mutual connections
    //   const mutualConnections = user.connecting?.filter((conn) =>
    //     person.connecting?.some((pConn) => pConn._id.equals(conn._id))
    //   );

    //   return mutualConnections.length > 0;
    // });

    // res.status(200).json({ suggestedPeople });
 
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
      user.resumePDF = []; 
    }
  
    if (!user.resumeVideo) {
      user.resumeVideo = []; 
    }
  
    // Push the file into the correct array based on file type
    if (fileType === "PDF") {
      user.resumePDF.push({
        fileUrl,
        fileName,
        uploadedAt: new Date(),
        isDeleted: false, // Add a default value for `isDeleted`
      });
    } else if (fileType === "Video") {
      user.resumeVideo.push({
        fileUrl,
        fileName,
        uploadedAt: new Date(),
        isDeleted: false, // Add a default value for `isDeleted`
      });
    }

    await user.save(); 

     res.status(200).json({ message: "Resume uploaded successfully", user });

};



// interface ResumeFile {
//   fileUrl: string;
//   fileName: string;
//   uploadedAt: Date;
//   isDeleted?: boolean;
// }

// export const uploadResume = async (req: Request, res: Response): Promise<void> => {
//   // Extract uploaded files
//   const files = req.files as { resume?: Express.Multer.File[]; introductionVideo?: Express.Multer.File[] };
//   console.log("Uploaded files:", files);

//   // Get individual files
//   const resumeFile = files?.resume?.[0] || null;
//   const videoFile = files?.introductionVideo?.[0] || null;

//   // If no files were uploaded, return an error
//   if (!resumeFile && !videoFile) {
//     return res.status(400).json({ success: false, message: "No files uploaded" });
//   }

//   const userId = req.user?.id;
//   // Find the user by ID
//   const user = await User.findById(userId);

//   // If user is not found, return an error
//   if (!user) {
//     return res.status(404).json({ success: false, message: "User not found" });
//   }

//   // Initialize resume arrays if they don't exist
//   if (!user.resumePDF) user.resumePDF = [];
//   if (!user.resumeVideo) user.resumeVideo = [];

//   // Process resume file if present
//   if (resumeFile) {
//     user.resumePDF.push({
//       fileUrl: resumeFile.path,
//       fileName: resumeFile.originalname,
//       uploadedAt: new Date(),
//     });
//     console.log("PDF Resume Uploaded:", user.resumePDF);
//   }

//   // Process video file if present
//   if (videoFile) {
//     user.resumeVideo.push({
//       fileUrl: videoFile.path,
//       fileName: videoFile.originalname,
//       uploadedAt: new Date(),
//     });
//     console.log("Video Resume Uploaded:", user.resumeVideo);
//   }

//   // Save the user with updated resume arrays
//   try {
//     await user.save();
//     // Respond with success message
//     res.status(200).json({ success: true, message: "Files uploaded successfully", user });
//   } catch (error) {
//     console.error("Error saving user:", error);
//     res.status(500).json({ success: false, message: "Failed to save user data" });
//   }
// };




//  const removeResumeFile = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId: string | undefined = req.user?.id
//         const fileType: "pdf" | "video" | undefined = req.query.fileType as "pdf" | "video";
// console.log("fileType",fileType)
//         if (!userId) {
//             res.status(401).json({ success: false, message: "Unauthorized access" });
//             return;
//         }

//         if (!fileType || (fileType !== "pdf" && fileType !== "video")) {
//             res.status(400).json({ success: false, message: "Invalid file type. Use 'pdf' or 'video'." });
//             return;
//         }

//         const user: IUser | null = await User.findById(userId);
//         if (!user) {
//             res.status(404).json({ success: false, message: "User not found" });
//             return;
//         }

        
//         let fileUrl: string | undefined = "";
//         if (fileType === "pdf" && user.resumePDF?.fileUrl) {
//             fileUrl = user.resumePDF.fileUrl;
//             user.resumePDF = { fileUrl: "", fileName: "", uploadedAt:null};
//         } else if (fileType === "video" && user.resumeVideo?.fileUrl) {
//             fileUrl = user.resumeVideo.fileUrl;
//             user.resumeVideo = { fileUrl: "", fileName: "", uploadedAt: null };
//         } else {
//             res.status(400).json({ success: false, message: `No ${fileType} file found to remove` });
//             return;
//         }

        
        

//         await user.save();
//         res.status(200).json({ success: true, message: `${fileType} removed successfully`, user });
//     } catch (error) {
//         console.error("Error removing file:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };


 const removeResumeFile = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.id; // Assuming `req.user?.id` contains the logged-in user's ID
  const fileType: "pdf" | "video" | undefined = req.query.fileType as "pdf" | "video";  // Extract fileType

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  // Validate the fileType
  if (!fileType || (fileType !== "pdf" && fileType !== "video")) {
    res.status(400).json({ success: false, message: "Invalid file type. Use 'pdf' or 'video'." });
    return;
  }

  // Fetch the user from the database
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  // Check if the resume fields exist and mark them as deleted
  if (fileType === "pdf" && Array.isArray(user.resumePDF)) {
    user.resumePDF.forEach((resume) => {
      resume.isDeleted = true; // Mark all PDFs as deleted
    });
  } else if (fileType === "video" && Array.isArray(user.resumeVideo)) {
    user.resumeVideo.forEach((resume) => {
      resume.isDeleted = true; // Mark all videos as deleted
    });
  } else {
    res.status(404).json({ success: false, message: `No ${fileType} files found to mark as deleted` });
    return;
  }

  try {
    await user.save(); // Save the updated user document

    res.status(200).json({ success: true, message: `${fileType} files marked as deleted.`,user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user data" });
  }
};



 

const AllUsersEmailCheck=async(req:Request,res:Response)=>{
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


const AllUsers=async(req:Request,res:Response)=>{
  const users=await User.find()
  const length=users.length
  if(!users){
    res.status(404).json({status:'failed',message:"cannot find users"})
    return
  }

  res.status(200).json({status:"success",message:"all users detailes",users,length})
  return
}


////////////////// ALL USER PROFILE ///////////////// 

const allUsersprofile = async (req:Request,res:Response):Promise<void>=>{

  const finduserprofile = await User.find({isDeleted:false,isBlocked:true})
  if(!finduserprofile){
    res.status(404).json({status:'failed',message:"cannot find all profile"})
    return
  }

  res.status(200).json({status:true,message:"All profile finded",data:finduserprofile})
}



export{
  RegistrationUser,
  login,
  logout,
  findCurrentUserDetails,
  googleauthlogin,
  AllUsersEmailCheck,
  AllUsers,
  allUsersprofile,
  removeResumeFile
  
}