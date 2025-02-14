import User from "../../model/UserSchema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";


const RegistrationUser = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    firstName,
    lastName,
    education,
    location,
    jobTitles,
    jobLocations,
  } = req.body;
  console.log("gggggreq.bodyy",req.body);
  
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
    education:education || [],
    location,
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
    { expiresIn: "7d" }
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
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

console.log("user",user);


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
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

  const { email,name,image } = req.body;

  
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
      profileImage:image, 
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

    const userId = req.user?.id; // Assuming `req.user` is set from authentication middleware
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Valid User ID is required" });
      return;
    }

    // Find user
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
      profileImage,
      banner
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
      ...(profileImage && { profileImage }),
      ...(banner && { banner }),

    };

    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });


    if (!updatedUser) {
      res.status(500).json({status:false, error: "Error updating user profile" });
      return;
    }

    res.status(200).json({status:true, message: "Profile updated successfully", user: updatedUser });
  


};



export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { resume?: Express.Multer.File[]; video?: Express.Multer.File[] };
    const pdfFile = files?.resume ? files.resume[0] : null;
    const videoFile = files?.video ? files.video[0] : null;

    console.log("pdfFile", pdfFile);
    console.log("videoFile", videoFile);
    console.log("Uploaded Files:", files);

    if (!pdfFile && !videoFile) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }

    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.resumePDF) user.resumePDF = [];
    if (!user.resumeVideo) user.resumeVideo = [];

   
    if (pdfFile) {
      const existingActivePDF = user.resumePDF.some((pdf) => !pdf.isDeleted);
      if (!existingActivePDF) {
        user.resumePDF.push({
          fileUrl: pdfFile.path,
          fileName: pdfFile.originalname,
          uploadedAt: new Date(),
          isDeleted: false,
        });
      } else {
        res.status(400).json({ success: false, message: "A resume PDF already exists." });
        return;
      }
    }

    if (videoFile) {
      const existingActiveVideo = user.resumeVideo.some((video) => !video.isDeleted);
      if (!existingActiveVideo) {
        user.resumeVideo.push({
          fileUrl: videoFile.path,
          fileName: videoFile.originalname,
          uploadedAt: new Date(),
          isDeleted: false,
        });
      } else {
        res.status(400).json({ success: false, message: "A resume video already exists." });
        return;
      }
    }

    await user.save();

   
    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      user: {
        ...user.toObject(),
        resumePDF: user.resumePDF.filter((pdf) => !pdf.isDeleted), 
        resumeVideo: user.resumeVideo.filter((video) => !video.isDeleted), 
      },
    });

  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }

};




export const getUploadedFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; 
console.log("user",userId);

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

  
    const activeResumePDFs = user.resumePDF?.filter((pdf) => !pdf.isDeleted);
    const activeResumeVideos = user.resumeVideo?.filter((video) => !video.isDeleted);

    res.status(200).json({
      success: true,
      message: "Uploaded files retrieved successfully",
      uploadedFiles: {
        resumePDFs: activeResumePDFs,
        resumeVideos: activeResumeVideos,
      },
    });

  } catch (error) {
    console.error("Error retrieving uploaded files:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




const removeResumeFile = async (req: Request, res: Response): Promise<void> => {
  const userId: string | undefined = req.user?.id;
  const fileType: "resume" | "introductionVideo" | undefined = req.query.fileType as "resume" | "introductionVideo";
  console.log("fileType",fileType);
  

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  if (!fileType || (fileType !== "resume" && fileType !== "introductionVideo")) {
    res.status(400).json({ success: false, message: "Invalid file type. Use 'pdf' or 'video'." });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  let updatedFiles = [];
  if (fileType === "resume" && Array.isArray(user.resumePDF)) {
    user.resumePDF.forEach((resume) => {
      resume.isDeleted = true;
    });

   
    updatedFiles = user.resumePDF.filter((resume) => !resume.isDeleted);
  } else if (fileType === "introductionVideo" && Array.isArray(user.resumeVideo)) {
    user.resumeVideo.forEach((resume) => {
      resume.isDeleted = true;
    });

 
    updatedFiles = user.resumeVideo.filter((resume) => !resume.isDeleted);
  } else {
    res.status(404).json({ success: false, message: `No ${fileType} files found to mark as deleted` });
    return;
  }

  try {
    await user.save();
    res.status(200).json({
      success: true,
      message: `${fileType} files marked as deleted.`,
      files: updatedFiles, 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user data" });
  }
};




 

const AllUsersEmailCheck=async(req:Request,res:Response)=>{
  const { email } = req.query;
  console.log("email req.query",req.query);
  
  const user = await User.findOne({ email });
console.log("useremail",user);

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

const spacificuserdetails = async (req:Request,res:Response):Promise<void>=>{
 
  const userid = req.params.id;

  if(!userid){
    res.status(404).json({status:false,message:"cannot find id"})
    return
  }
  const finduserprofile = await User.findOne({_id:userid,isDeleted:false,isBlocked:false}).populate('connecting.connectionID')
  
  if(!finduserprofile){
    res.status(404).json({status:false,message:"cannot find all profile"})
    return
  }

  res.status(200).json({status:true,message:"All profile finded",finduserprofile})
}



export{
  RegistrationUser,
  login,
  logout,
  findCurrentUserDetails,
  googleauthlogin,
  AllUsersEmailCheck,
  AllUsers,
  spacificuserdetails,
  removeResumeFile
  
}