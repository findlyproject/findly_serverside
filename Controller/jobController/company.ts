import { Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { CustomError } from "../../Utils/errorHandler";

export const createJobPost = async (req: Request, res: Response): Promise<void> => {

        const companyId = req.company?.id;
console.log("heyy");


        const {
            title,
            company,
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
console.log("salary",salary);

if (salary && typeof salary === 'object' && 'rate' in salary && 'min' in salary && 'max' in salary) {
} else {
    res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
    return;
}

        const job = new JobPost({
            title,
            company,
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
            postedBy: companyId,
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




