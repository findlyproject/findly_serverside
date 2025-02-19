import { Request, Response } from "express";
import {JobPost} from "../../model/JobSchema";
import {JobApplication} from "../../model/JobApplicationSchema"
import { CustomError } from "../../Utils/errorHandler";

export const applyToJob = async (req: Request, res: Response): Promise<void> => {

        const { jobId } = req.params; 
        const userId = req.user?.id; 

        console.log("userId", userId);
        const files = req.files as {
            resume?: Express.Multer.File[];
            video?: Express.Multer.File[];
          };
          const pdfFile = files?.resume ? files.resume[0] : null;
          const videoFile = files?.video ? files.video[0] : null;
      
        console.log("pdfFile",pdfFile);
        console.log("videoFile",videoFile);
        
              if (!pdfFile && !videoFile) {
                throw new CustomError("No files uploaded",400)
          
              }
        const { coverLetter } = req.body;
        const job = await JobPost.findOne({ _id: jobId, isDeleted: false });

        if (!job) {
            res.status(404).json({ message: "Job post not found or has been deleted" });
            return;
        }

  
        const existingApplication = await JobApplication.findOne({ jobId, userId });

        if (existingApplication) {
            res.status(400).json({ message: "You have already applied for this job" });
            return;
        }


        const application = new JobApplication({
            jobId,
            userId,
            companyId:job.postedBy,
            resume: pdfFile?.path, 
            coverLetter,
            introVideo: videoFile?.path, 
            status: "Pending",
        });

        await application.save();

    
        res.status(201).json({
            message: "Application submitted successfully",
            application: {
                _id: application._id,
                jobId: application.jobId,
                userId: application.userId,
                status: application.status,
                resume: application.resume,
                introVideo: application.introVideo,
            },
        });


};


