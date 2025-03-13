import { SubscriptionPlan } from "../../model/SubscriptionSchema";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Request, Response } from "express";
import { generateOTP } from "../../Utils/otpGenerator";
import { sendOTP } from "../../Utils/otpService";

export const findCurrentUserDetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {  
      throw new CustomError("User ID is missing",404);
    }
  
    const currentUserDetails = await User.findById(userId).select("-password");
  
    if (!currentUserDetails) {
      throw new CustomError("User not found",404);
      
    }
  
    res.status(200).json({ success: true,message:"current user details", currentUserDetails });
  };
  
  export const getPeopleYouMightKnow = async (req: Request, res: Response): Promise<void> => {
   
      const userId = req.user?.id;
  
      const loggedInUser = await User.findById(userId).lean();
  
      if (!loggedInUser) {
      throw new CustomError("User not found",404);
      }
  
      const { skills, jobTitle, location, connecting } = loggedInUser;
  
      const connectedUserIds = connecting.map(conn => conn.connectionID.toString());
  
      const suggestedUsers = await User.find({
        _id: { $ne: userId, $nin: connectedUserIds }, 
        isBlocked: false,
        isDeleted: false,
        $or: [
          { skills: { $in: skills } },
          { jobTitle: { $in: jobTitle } },
          { "location.country": location?.country, "location.state": location?.state, "location.city": location?.city }
        ]
      })
        .select("firstName lastName profileImage jobTitle location") 
        .limit(10) 
        .lean();
  
      res.status(200).json({status:true,message:"found", suggestedUsers });
  };
     
  
  // export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  
  //     const userId = req.user?.id; 
      
  
  //   const user = await User.findById(userId);
  //   if (!user) {
  //     throw new CustomError("User not found",404);
  //   }
  
      
  //     const {
  //       firstName,
  //       lastName,
  //       email,
  //       phoneNumber,
  //       dateOfBirth,
  //       location,
  //       skills,
  //       jobTitle,
  //       jobLocation,
  //       about,
  //       education,
  //       projects,
  //       profileImage,
  //       banner
  //     } = req.body;
  
  //     const updateData: { [key: string]: any } = {
  //       ...(firstName && { firstName }),
  //       ...(lastName && { lastName }),
  //       ...(email && { email }),
  //       ...(phoneNumber && { phoneNumber }),
  //       ...(dateOfBirth && { dateOfBirth }),
  //       ...(location && { location }),
  //       ...(skills && { skills }),
  //       ...(jobTitle && { jobTitle }),
  //       ...(jobLocation && { jobLocation }),
  //       ...(about && { about }),
  //       ...(education && { education }),
  //       ...(projects && { projects }),
  //       ...(profileImage && { profileImage }),
  //       ...(banner && { banner }),
  
  //     };
  
  //   const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
  //     new: true,
  //   });
  
  //     if (!updatedUser) {
  //       throw new CustomError("User not found",404);
        
  //     }
  
  //     res.status(200).json({status:true, message: "Profile updated successfully", user: updatedUser });
    
  
  
  // };

  // update user profile //
  
  //banner
  export const updateBanner = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
        throw new CustomError("User not found", 404);
    }

    const { banner } = req.body;

    if (!banner) {
        throw new CustomError("Banner is required", 400);
    }

    user.banner = banner;
    await user.save();

    res.status(200).json({ status: true, message: "Banner updated successfully", user });
};

//profile image
export const updateProfileImage = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;


  const user = await User.findById(userId);
  if (!user) {
      throw new CustomError("User not found", 404);
  }

  const { profileImage } = req.body;
console.log("req.body",req.body)
  if (!profileImage) {
      throw new CustomError("Profile image is required", 400);
  }

  user.profileImage = profileImage;
  console.log(user)
  await user.save();

  res.status(200).json({ status: true, message: "Profile image updated successfully", user });
  return
};

//personal details
export const updateBasicInfo = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
      throw new CustomError("User not found", 404);
  }
const {basicInfo}=req.body
  const { firstName, lastName, email, phoneNumber, dateOfBirth, gender, about } = basicInfo;
const updateData: { [key: string]: any } = {
  ...(firstName && { firstName }),
  ...(lastName && { lastName }),
  ...(email && { email }),
  ...(phoneNumber && { phoneNumber }),
  ...(dateOfBirth && { dateOfBirth }),
  ...(gender && { gender }),
  ...(about && { about }),
};

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  res.status(200).json({ status: true, message: "Basic information updated successfully", user: updatedUser });
};

//professional details
export const updateOtherDetails = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user) {
      throw new CustomError("User not found", 404);
  }
  const {otherDetails}=req.body
  const { location, skills, jobTitle, jobLocation, education, projects,experience } = otherDetails;

  const updateData: { [key: string]: any } = {
      ...(location && { location }),
      ...(skills && { skills }),
      ...(jobTitle && { jobTitle }),
      ...(jobLocation && { jobLocation }),
      ...(education && { education }),
      ...(projects && { projects }),
      ...(experience && { experience }),
  };

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

  res.status(200).json({ status: true, message: "Other details updated successfully", user: updatedUser });
};

//email verification
interface OTPStore {
  [key: string]: { otp: string; createdAt: number };
}
const OTP_EXPIRATION_TIME = 2 * 60 * 1000;
const otpStore: OTPStore = {};
  export const sendotp = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;
    const existingCompany = await User.findOne({ email });
    if (existingCompany) {
      throw new CustomError("Company already exists", 400);
    }
    const otp = generateOTP();
    otpStore[email] = { otp, createdAt: Date.now() };
    await sendOTP(email, otp);
    res.status(200).json({
      message: "OTP sent to your email. Please verify to proceed.",
    });
  };
  
  // OTP Verification
  export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { otp, email } = req.body;
  
    if (otpStore[email]?.otp !== otp.toString()) {
      throw new CustomError("Invalid OTP. Please try again.", 400);
    }
  
    res.status(200).json({
      message:
        "OTP verified successfully. Please proceed to fill the registration form.",
    });
  
    delete otpStore[email];
  };
  
  
  export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  
      const files = req.files as {
        resume?: Express.Multer.File[];
        video?: Express.Multer.File[];
      };
      const pdfFile = files?.resume ? files.resume[0] : null;
      const videoFile = files?.video ? files.video[0] : null;
  
  
      if (!pdfFile && !videoFile) {
        throw new CustomError("No files uploaded",400)
  
      }
  
      const userId = req.user?.id;
      const user = await User.findById(userId);
  
      if (!user) {
        throw new CustomError("User not found",400)
  
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
          throw new CustomError("A resume PDF already exists.",400)
      
        }
      }
  
      if (videoFile) {
        const existingActiveVideo = user.resumeVideo.some(
          (video) => !video.isDeleted
        );
        if (!existingActiveVideo) {
          user.resumeVideo.push({
            fileUrl: videoFile.path,
            fileName: videoFile.originalname,
            uploadedAt: new Date(),
            isDeleted: false,
          });
        } else {
          throw new CustomError("A resume video already exists.",400)
     
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
  
  };
  
  export const getUploadedFiles = async (
    req: Request,
    res: Response
  ): Promise<void> => {
  
      const userId = req.user?.id;
  
      if (!userId) {
        throw new CustomError("Unauthorized",401)
  
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        throw new CustomError("User not found",401)
   
      }
  
      const activeResumePDFs = user.resumePDF?.filter((pdf) => !pdf.isDeleted);
      const activeResumeVideos = user.resumeVideo?.filter(
        (video) => !video.isDeleted
      );
  
      res.status(200).json({
        success: true,
        message: "Uploaded files retrieved successfully",
        uploadedFiles: {
          resumePDFs: activeResumePDFs,
          resumeVideos: activeResumeVideos,
        },
      });
  
  };
  
  export const removeResumeFile = async (req: Request, res: Response): Promise<void> => {
    const userId: string | undefined = req.user?.id;
    const fileType: "resume" | "introductionVideo" | undefined = req.query
      .fileType as "resume" | "introductionVideo";
  
  
    if (!userId) {
      throw new CustomError("Unauthorized",401)
  
    }
  
    if (
      !fileType ||
      (fileType !== "resume" && fileType !== "introductionVideo")
    ) {
      throw new CustomError("Invalid file type. Use 'pdf' or 'video'.",400)
  
    }
  
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found",401)
  
    }
  
    let updatedFiles = [];
    if (fileType === "resume" && Array.isArray(user.resumePDF)) {
      user.resumePDF.forEach((resume) => {
        resume.isDeleted = true;
      });
  
      updatedFiles = user.resumePDF.filter((resume) => !resume.isDeleted);
    } else if (
      fileType === "introductionVideo" &&
      Array.isArray(user.resumeVideo)
    ) {
      user.resumeVideo.forEach((resume) => {
        resume.isDeleted = true;
      });
  
      updatedFiles = user.resumeVideo.filter((resume) => !resume.isDeleted);
    } else {
      throw new CustomError(`No ${fileType} files found to mark as deleted`,404)
  
    }
  
      await user.save();
      res.status(200).json({
        success: true,
        message: `${fileType} files marked as deleted.`,
        files: updatedFiles,
      });
  
  };
  
  ////////////////// ALL USER PROFILE /////////////////

export const spacificuserdetails = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userid = req.params.id;
  
    if(!userid){
      res.status(404).json({status:false,message:"cannot find id"})
      return
    }
    const finduserprofile = await User.findOne({_id:userid,isDeleted:false,isBlocked:false}).populate('connecting.connectionID')
  console.log(finduserprofile)
    
    if(!finduserprofile){
      res.status(404).json({status:false,message:"cannot find  profile"})
      return
    }
  
    res
      .status(200)
      .json({ status: true, message: "All profile finded", finduserprofile });
  };
  
  export const getTotalRevenue=async(req:Request,res:Response):Promise<void>=>{
    const revenue=await SubscriptionPlan.aggregate([
      {
      $match:{paymentStatus:'completed'}
      },
      {
      $group:{
        _id:null,
        totalRevenue: { $sum: "$price" }
      }
    }])
    res.status(200).json({ status:true,message:"total revenue",totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0})
  
  }

  export const getPrimeClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const primeClients = await SubscriptionPlan.find({
            paymentStatus: "completed",
            active: true
        }, {
            _id: 1, 
            userId: 1,
            companyId: 1,
            price: 1,
            plan: 1,
            type: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1
        });
console.log("primeClients",primeClients);

        res.status(200).json({
            status: true,
            message: "List of prime clients (Users & Companies)",
            primeClients
        });
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error", error });
    }
};