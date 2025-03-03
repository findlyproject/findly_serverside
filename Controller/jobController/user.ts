import { Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { JobApplication } from "../../model/JobApplicationSchema"
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { JobSave } from "../../model/JobSaveScheema";
import { Company } from "../../model/CompanySchema";


export const applyToJob = async (req: Request, res: Response): Promise<void> => {

    const { jobId } = req.params;
    const userId = req.user?.id;
    const { coverLetter, resumeName, resumeUrl, resumeVideoName, resumeVideoUrl } = req.body;

    if (!coverLetter) {
        res.status(404).json({ status: false, message: "Cover letter is required" })
        return
    }

    const findUser = await User.findOne({ _id: userId })

    if (!findUser) {
        res.status(404).json({ status: false, message: "User not found" })
        return
    }

    const resumdocument = findUser?.resumePDF?.find(item => item.isDeleted === false)
    const resumVideoFile = findUser?.resumeVideo?.find(item => item.isDeleted === false)

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
        coverLetter,
        status: "Pending",
        companyId: job.company,
        resumeName: resumeName ? resumeName : resumdocument?.fileName,
        resumeurl: resumeUrl ? resumeUrl : resumdocument?.fileUrl,
        introVideoName: resumeVideoName ? resumeVideoName : resumVideoFile?.fileName,
        introVideoUrl: resumeVideoUrl ? resumeVideoUrl : resumVideoFile?.fileUrl,
    });

    const saveapplication = await application.save();


    res.status(201).json({
        message: "Application submitted successfully",
        application: saveapplication
    });


};


// finde applyde jobs //

export const applydeJobs = async (req:Request,res:Response):Promise<void>=>{
    const userId = req.user?.id;
    if(!userId){
        throw new CustomError("user id is not found",404)
    }

    const findeapllyedJObs = await JobApplication.find({userId}) .populate({
        path: 'jobId',
        populate: {
          path: 'company' 
        }
      })
      .populate('userId', 'firstName email');
    if(findeapllyedJObs.length<0){
        res.status(404).json({status:false,message:"applyed jobs not found"})
    }
    res.status(200).json({status:true,message:"applyed jobs",data:findeapllyedJObs})
}


/// save jobs //

export const saveJobs = async(req:Request,res:Response):Promise<void>=>{
    
    const userId = req.user?.id;
    if(!userId){
        res.status(404).json({status:false,message:"user id is not found"})
        return
     
    }
    const jobId = req.params.id;
    if(!jobId){
        res.status(404).json({status:false,message:"jobId is not found"})
    }


    const existingJob = await JobSave.findOne({ userId, jobId });

if (existingJob) {
    await JobSave.findByIdAndDelete(existingJob._id);
     res.status(200).json({ status: true, message: "Job unsaved",existingJob });
     return
}

    const savejobes = new JobSave({
        userId,
        jobId
    })
    const savejobe = savejobes.save()
    res.status(200).json({status:true,message:"job saved",data:savejobe})
}

// get saved jobs //

export const getsavedjobs = async (req:Request,res:Response):Promise<void>=>{
    const userId = req.user?.id;
    if (!userId) {
        throw new CustomError("User ID is not found", 404);
    }
    
    const page = Number(req.query.page) || 1; 
    const limit = 10; 
    const skip = (page - 1) * limit;  
    
    const totalSavedJobs = await JobSave.countDocuments({ userId }); 
    
    const savedJobs = await JobSave.find({ userId })
    .populate({
        path: 'jobId',
        populate: {
          path: 'company' 
        }
      })
        .populate("userId")
        .skip(skip)
        .limit(limit);
    
    if (savedJobs.length === 0) {
         res.status(404).json({ status: false, message: "Saved jobs not found" });
         return
    }
    
    res.status(200).json({
        status: true,
        message: "Saved jobs retrieved successfully",
        totalPages: Math.ceil(totalSavedJobs / limit), 
        currentPage: page,
        totalJobs: totalSavedJobs,
        data: savedJobs
    });
    
}

/// get simular jobs and same company jobs

export const similarjobs = async (req:Request,res:Response):Promise<void>=>{
    const { jobType, companyName } = req.params;
console.log({ jobType, companyName });

const page = Number(req.query.page) || 1;
const limit = 4;
const skip = (page - 1) * limit;

const totalJobs = await JobPost.countDocuments({ 
    jobType, 
});
console.log("totalJobs,totalJobs",totalJobs);

const jobs = await JobPost.find({ 
    jobType, 
})
    .populate("company")
    .skip(skip)
    .limit(limit);

    const allJobs = await JobPost.find()
        .populate("company")
        .skip(skip)
        .limit(limit);
    const filteredJobs = allJobs.filter(job => job?.company?.name == companyName);
    
    res.status(200).json({
    success: true,
    message: "Jobs filtered successfully",
    similarjobs:jobs,
    similarcompany:filteredJobs,
    currentPage: page,
    totalPages: Math.ceil(totalJobs / limit),
    totalJobs,
    hasMore: page * limit < totalJobs,
});

}