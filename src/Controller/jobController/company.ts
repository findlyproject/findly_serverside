import { application, Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { CustomError } from "../../Utils/errorHandler";
import { JobApplication } from "../../model/JobApplicationSchema";
import nodemailer from "nodemailer";
import { ParsedQs } from "qs";
import User from "../../model/UserSchema";
import { Company } from "../../model/CompanySchema";
const { VertexAI } = require('@google-cloud/vertexai');
import OpenAI from "openai";
import axios from "axios";
export const createJobPost = async (req: Request, res: Response): Promise<void> => {

    const companyId = req.user?.id;


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
console.log(req.body)
    // if (salary && typeof salary === 'object' && 'rate' in salary && 'min' in salary && 'max' in salary) {
    // } else {
    //     res.status(400).json({ message: "Invalid salary format. Expected an object with rate, min, and max." });
    //     return;
    // }

    const job = new JobPost({
        title,
        company: companyId,
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
    console.log(job)
    res.status(201).json({ message: "Job post created successfully", job });

};


export const updateJobPost = async (req: Request, res: Response): Promise<void> => {

    const jobId = req.params.jobId;
    const companyId = req.user?.id;

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

    console.log("experienceLevel",experienceLevel);
    

    const job = await JobPost.findOne({ _id: jobId, company: companyId });

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


export const updateJobDeadline = async (req: Request, res: Response): Promise<void> => {

        const jobId = req.params.jobId;
        const companyId = req.user?.id; 

        const { applicationDeadline } = req.body;

        if (!applicationDeadline) {
            res.status(400).json({ message: "Application deadline is required" });
            return;
        }

     
        const job = await JobPost.findOne({ _id: jobId, company: companyId });

        if (!job) {
            res.status(404).json({ message: "Job post not found or unauthorized" });
            return;
        }

        job.applicationDeadline = applicationDeadline;
        await job.save();

        res.status(200).json({
            message: "Job application deadline updated successfully",
            applicationDeadline
        });

};




export const deleteJobPost = async (req: Request, res: Response): Promise<void> => {

    const jobId = req.params.jobId;
    const companyId = req.user?.id;


    const job = await JobPost.findOne({ _id: jobId, company: companyId });

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
    if (!jobId) {
        throw new CustomError("job Id is required", 400);
    }
    const findJob = await JobPost.findOne({ _id: jobId, isDeleted: false }).populate("company");
    if (!findJob) {
        throw new CustomError("job not found", 404);
    }
    res.status(200).json({ status: true, message: "get jobs by id", findJob })

};

////// get all job post 

interface Ifilter {
    isDeleted: boolean;
    workingSchedule?: { $in: string[] };
    employmentType?: { $in: string[] };
    salaryType?: { $in: string[] };
    jobLocation?: { $in: string[] };
}

export const getAllJobPost = async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, Number(req.query.page) || 1); // Ensures page is at least 1
const limit = 10;
const skip = (page - 1) * limit;

let filters: Record<string, any> = { isDeleted: false };

const parseQueryParam = (param: any): string[] => {
    if (!param) return [];
    return Array.isArray(param) ? param.map(String) : String(param).split(",");
};

const filterKeys = ["title", "experienceLevel", "industry", "jobType"];
filterKeys.forEach((key) => {
    const values = parseQueryParam(req.query[key]).filter(Boolean); // Removes empty strings
    if (values.length > 0) {
        filters[key] = { $in: values };
    }
});

    const jobs = await JobPost.find(filters)
        .populate("company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalJobs = await JobPost.countDocuments(filters);

    res.status(200).json({
        success: true,
        message: "All jobs fetched successfully",
        jobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        hasMore: page * limit < totalJobs,
    });
};


// jobs by id //


// export const getJobsByCompanies = async (req: Request, res: Response) => {
//     const type = req.user && req.user.type

//     if (type !== "Company") {
//         res.status(403).json({ success: false, message: "Unauthorized" })
//         return
//     }
//     let companyId = type === "Company" ? req.user?.id : null



//     const postedJobs = await JobPost.find({ company: companyId }).populate("company")

//     res.status(200).json({ success: true, message: "found it", postedJobs })
// }

export const getJobsByCompanies = async (req: Request, res: Response) => {
    const type = req.user && req.user.type;

    if (type !== "Company") {
         res.status(403).json({ success: false, message: "Unauthorized" });
         return
    }

    const companyId = req.user?.id;


    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) ;
    let skip = (page - 1) * limit;
        const postedJobs = await JobPost.find({ company: companyId,isDeleted:false })
            .populate("company")
            .skip(skip)
            .limit(limit);

       
        const totalJobs = await JobPost.countDocuments({ company: companyId });
        console.log("totalJobs",totalJobs);
        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            totalPages: Math.ceil(totalJobs / limit),
            currentPage: page,
            totalJobs,
            jobsPerPage: postedJobs.length,
            postedJobs,
        });

};


export const findAppliedUsers = async (req: Request, res: Response) => {
    const companyId = req.user?.id;
    const appliedUsers = await JobApplication.find({ companyId,isCompanyDelete:false }).populate("userId").populate("jobId")


    res.status(200).json({ success: true, message: "found all applications", appliedUsers })
}


export const findUserApplication = async (req: Request, res: Response) => {

    const { userId, jobId } = req.params;
    if (!userId || !jobId) {
        throw new CustomError("User ID and Job ID are required", 400);
    }


    const application = await JobApplication.findOne({ userId, jobId }).populate("userId").populate("jobId")

    if (!application) {
        throw new CustomError("No application found for this user and job", 404);
    }

    res.status(200).json({
        success: true,
        message: "Application found",
        application
    });

};

// Function to reject a job application

export const rejectJobApplication = async (req: Request, res: Response) => {
    const { userId, jobId } = req.params;

    if (!userId || !jobId) {
        throw new CustomError("User ID and Job ID are required", 400);
    }

    // Find the application and populate userId and jobId fields
    const application = await JobApplication.findOne({ userId, jobId })
        .populate("userId", "email firstName")
        .populate("jobId", "title");

    if (!application) {
        throw new CustomError("No application found for this user and job", 404);
    }

    // Ensure userId and jobId are populated objects
    if (!("email" in application.userId) || !("firstName" in application.userId)) {
        throw new CustomError("User data is not populated correctly", 500);
    }

    if (!("title" in application.jobId)) {
        throw new CustomError("Job data is not populated correctly", 500);
    }

    // Update status
    application.status = "Rejected";
    await application.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: application.userId.email,  
        subject: "Job Application Update",
        text: `Dear ${application.userId.firstName},\n\nWe regret to inform you that your application for the position of ${application.jobId.title} has been rejected.\n\nThank you for your interest.\n\nBest regards,\nCompany Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
        success: true,
        message: "Application rejected and email sent to the user",
    });


};

export const approveJobApplication = async (req: Request, res: Response): Promise<void> => {
    const { userId, jobId } = req.params;
    const { offerLetter } = req.body;

    if (!userId || !jobId || !offerLetter) {
        res.status(400).json({ success: false, message: "User ID, Job ID, and offer letter are required" });
        return
    }

    const application = await JobApplication.findOne({ userId, jobId })
        .populate("userId", "email firstName")
        .populate("jobId", "title");

    if (!application) {
        res.status(404).json({ success: false, message: "No application found for this user and job" });
        return
    }

    if (!("email" in application.userId) || !("firstName" in application.userId)) {
        res.status(500).json({ success: false, message: "User data is not populated correctly" });
        return
    }

    if (!("title" in application.jobId)) {
        res.status(500).json({ success: false, message: "Job data is not populated correctly" });
        return
    }

    application.status = "Accepted";
    application.offerLetter = offerLetter;
    await application.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: application.userId.email,
        subject: "Job Offer Letter",
        text: `Dear ${application.userId.firstName},\n\nCongratulations! Your application for the position of ${application.jobId.title} has been approved. Please find your offer letter attached.\n\nBest regards,\nCompany Team`,
        attachments: [
            {
                filename: "Offer_Letter.pdf",
                content: offerLetter, // Assuming the offer letter is in text format, convert if needed
            },
        ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
        success: true,
        message: "Application approved and offer letter sent via email",
    });
};





export const generateOfferLetter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobApplicationId, startDate } = req.body;
console.log(req.body)
    if (!jobApplicationId || !startDate) {
      res.status(400).json({ error: "Job application ID and start date are required" });
      return;
    }

    const jobApplication = await JobApplication.findById(jobApplicationId);
    if (!jobApplication) {
      res.status(404).json({ error: "Job application not found" });
      return;
    }

    const [jobPost, company, user] = await Promise.all([
      JobPost.findById(jobApplication.jobId),
      Company.findById(jobApplication.companyId),
      User.findById(jobApplication.userId),
    ]);

    if (!jobPost || !company || !user) {
      res.status(404).json({ error: "Related data not found" });
      return;
    }


    // Construct the prompt
    const prompt = `Generate a formal offer letter for ${user.firstName} ${user.lastName} for the position of ${jobPost.title} at ${company.name}.

    Company: ${company.name}, Address: ${company.address?.city || ""}, ${company.address?.state || ""}
    Job Title: ${jobPost.title}, Job Type: ${jobPost.jobType}, Start Date: ${startDate}
    Salary: ${jobPost.salary.min} - ${jobPost.salary.max} ${jobPost.salary.rate}
    contact number:${company.contact}
    Candidate: ${user.firstName} ${user.lastName}, Email: ${user.email}
    interview date ${startDate}
    Use a formal and professional tone. Include standard offer letter clauses.

    `;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new CustomError("GEMINI_API_KEY is not configured", 400);
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );
    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new CustomError("No candidates found in Gemini API response", 500);
    }

    const offerLetter = candidates[0]?.content?.parts?.[0]?.text;

    if (!offerLetter) {
      res.status(500).json({ error: "Failed to generate offer letter" });
      return;
    }

    // Save offer letter to job application
    jobApplication.offerLetter = offerLetter;
    await jobApplication.save();

    res.json({ offerLetter });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Error generating offer letter" });
  }
};


