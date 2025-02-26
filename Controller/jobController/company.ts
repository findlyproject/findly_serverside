import { application, Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { CustomError } from "../../Utils/errorHandler";
import { JobApplication } from "../../model/JobApplicationSchema";

export const createJobPost = async (req: Request, res: Response): Promise<void> => {

        const companyId = req.company?.id;


        const {
            title,
            location,
            jobType,
            experienceLevel,
            industry,
            description,
            requirements,
            jobResponsibilities,
            salary,
            applicationDeadline,
            benefits,
            contactEmail,
            contactPhone,
            status
        } = req.body;

if (salary && typeof salary === 'object' && 'rate' in salary && 'min' in salary && 'max' in salary) {
} else {
    res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
    return;
}

        const job = new JobPost({
            title,
            company:companyId,
            location,
            jobType,
            experienceLevel,
            industry,
            description,
            requirements,
            jobResponsibilities,
            salary,
            applicationDeadline,
            benefits,
            contactEmail,
            contactPhone,
            status: status || "Open", 
        });

        await job.save();   
        res.status(201).json({ message: "Job post created successfully", job });

};


export const updateJobPost = async (req: Request, res: Response): Promise<void> => {

        const jobId = req.params.jobId;
        const companyId = req.company?.id;
        
        const {
            title,
            location,
            jobType,
            experienceLevel,
            industry,
            description,
            requirements,
            jobResponsibilities,
            salary,
            applicationDeadline,
            benefits,
            contactEmail,
            contactPhone,
            status
        } = req.body;

        const job = await JobPost.findOne({ _id: jobId, postedBy: companyId });

        if (!job) {
            res.status(404).json({ message: "Job post not found or you do not have permission to edit it" });
            return;
        }
        const updatedFields: Record<string, any> = {};

        if (title) updatedFields.title = title;
        if (location) updatedFields.location = location;
        if (jobType) updatedFields.jobType = jobType;
        if (experienceLevel) updatedFields.experienceLevel = experienceLevel;
        if (industry) updatedFields.industry = industry;
        if (description) updatedFields.description = description;
        if (requirements) updatedFields.requirements = requirements;
        if (jobResponsibilities) updatedFields.jobResponsibilities = jobResponsibilities;
        if (salary && typeof salary === "object" && "rate" in salary && "min" in salary && "max" in salary) {
            updatedFields.salary = salary;
            console.log("ddd");
            
        } else if (salary) {
            res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
            return;
        }  
        if (applicationDeadline) updatedFields.applicationDeadline = applicationDeadline;
        if (benefits) updatedFields.benefits = benefits;
        if (contactEmail) updatedFields.contactEmail = contactEmail;
        if (contactPhone) updatedFields.contactPhone = contactPhone;
        if (status) updatedFields.status = status;
        Object.assign(job, updatedFields);
        await job.save();
        res.status(200).json({
            message: "Job post updated successfully",
            updatedFields
        });


};



export const deleteJobPost = async (req: Request, res: Response): Promise<void> => {

        const jobId = req.params.jobId; 
        const companyId = req.company?.id; 


        const job = await JobPost.findOne({ _id: jobId, postedBy: companyId });

        if (!job) {
            res.status(404).json({ message: "Job post not found or you do not have permission to delete it" });
            return;
        }

        job.isDeleted = true;
        await job.save();

        res.status(200).json({ message: "Job post soft deleted successfully" });

};







/// get jobs by id //

export const getJobsById = async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.id;
    if(!jobId){
    throw new CustomError("job Id is required", 400);
    }
    const findJob = await JobPost.findById(jobId);
    if(!findJob){
        throw new CustomError("job not found", 404);
    }
};





////// get all job post 

export const getAllJobPost = async (req: Request, res: Response): Promise<void> => {

    const page = parseInt(req.query.page as string) || 1;  
    const limit = 10; 
    const skip = (page - 1) * limit;    

    const jobs = await JobPost.find({ isDeleted: false })
        .populate("postedBy")
        .skip(skip)
        .limit(limit);

    const totalJobs = await JobPost.countDocuments({ isDeleted: false });

    res.status(200).json({
        status: true,
        message: "All jobs fetched successfully",
        jobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs
    });

}

export const findAppliedUsers=async(req:Request,res:Response)=>{
        const companyId=req.company?.id;
        const appliedUsers=await JobApplication.find({companyId}).populate("userId").populate("jobId")
        if(!appliedUsers){
            throw new CustomError("no applications found",404)
        }

        res.status(200).json({success:true,message:"found all applications",appliedUsers})
}


export const findUserApplication = async (req: Request, res: Response) => {

        const { userId, jobId } = req.params; 

        if (!userId || !jobId) {
            throw new CustomError("User ID and Job ID are required", 400);
        }

   
        const application = await JobApplication.findOne({ userId, jobId });

        if (!application) {
            throw new CustomError("No application found for this user and job", 404);
        }

        res.status(200).json({
            success: true,
            message: "Application found",
            application
        });
   
};
