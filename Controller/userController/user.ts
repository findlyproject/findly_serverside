import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { Request, Response } from "express";

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

  export const getPeopleYouMightKnow = async (
    req: Request,
    res: Response
  ): Promise<void> => {
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
      
  
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found",404);
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
  
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
  
      if (!updatedUser) {
        throw new CustomError("User not found",404);
        
      }
  
      res.status(200).json({status:true, message: "Profile updated successfully", user: updatedUser });
    
  
  
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
      console.log("user", userId);
  
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
  
    
    if(!finduserprofile){
      res.status(404).json({status:false,message:"cannot find all profile"})
      return
    }
  
    res
      .status(200)
      .json({ status: true, message: "All profile finded", finduserprofile });
  };
  
  