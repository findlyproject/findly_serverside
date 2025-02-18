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
        
        // Destructure the fields to be updated from the request body
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

        // Update the job post with the provided details
        job.title = title || job.title;
        job.location = location || job.location;
        job.jobType = jobType || job.jobType;
        job.experienceLevel = experienceLevel || job.experienceLevel;
        job.industry = industry || job.industry;
        job.description = description || job.description;
        job.requirements = requirements || job.requirements;
        job.jobResponsibilities = jobResponsibilities || job.jobResponsibilities;
        job.salary = salary || job.salary;
        job.applicationDeadline = applicationDeadline || job.applicationDeadline;
        job.benefits = benefits || job.benefits;
        job.contactEmail = contactEmail || job.contactEmail;
        job.contactPhone = contactPhone || job.contactPhone;
        job.status = status || job.status || job.status; // Preserve existing status if not updated

        // Save the updated job post
        await job.save();

        // Respond with the updated job details
        res.status(200).json({
            message: "Job post updated successfully",
            job: {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                jobType: job.jobType,
                salary: job.salary,
                status: job.status
            }
        });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
