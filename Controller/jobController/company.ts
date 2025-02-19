import { Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { CustomError } from "../../Utils/errorHandler";

export const createJobPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = req.company?.id; // Assuming `req.company` holds authenticated company data


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
console.log(req.body);



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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateJobPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.params.jobId; // Get the job post ID from the URL parameters
        const companyId = req.company?.id; // Assuming `req.company` holds the authenticated company data
        
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

        // Find the job post by its ID and verify that the authenticated company is the owner
        const job = await JobPost.findOne({ _id: jobId, postedBy: companyId });

        if (!job) {
            // If the job post doesn't exist or doesn't belong to the authenticated company, return an error
            res.status(404).json({ message: "Job post not found or you do not have permission to edit it" });
            return;
        }

        // Update only the fields provided in the request body
        const updatedFields: Record<string, any> = {};

        if (title) updatedFields.title = title;
        if (location) updatedFields.location = location;
        if (jobType) updatedFields.jobType = jobType;
        if (experienceLevel) updatedFields.experienceLevel = experienceLevel;
        if (industry) updatedFields.industry = industry;
        if (description) updatedFields.description = description;
        if (requirements) updatedFields.requirements = requirements;
        if (jobResponsibilities) updatedFields.jobResponsibilities = jobResponsibilities;
        if (salary) updatedFields.salary = salary;
        if (applicationDeadline) updatedFields.applicationDeadline = applicationDeadline;
        if (benefits) updatedFields.benefits = benefits;
        if (contactEmail) updatedFields.contactEmail = contactEmail;
        if (contactPhone) updatedFields.contactPhone = contactPhone;
        if (status) updatedFields.status = status;

        // Update the job post with the new values
        Object.assign(job, updatedFields);

        // Save the updated job post
        await job.save();

        // Respond with the updated fields only
        res.status(200).json({
            message: "Job post updated successfully",
            updatedFields
        });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const deleteJobPost = async (req: Request, res: Response): Promise<void> => {
    try {
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

    } catch (error) {
        
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
