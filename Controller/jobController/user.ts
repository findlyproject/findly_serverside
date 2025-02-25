import { Request, Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { JobApplication } from "../../model/JobApplicationSchema"
import User from "../../model/UserSchema";

export const applyToJob = async (req: Request, res: Response): Promise<void> => {

    const { jobId } = req.params;
    const userId = req.user?.id;
    const { coverLetter, resumeName, resumeUrl, resumeVideoName, resumeVideoUrl } = req.body;
    console.log("{ coverLetter,resumDoc,resumVideo}", { coverLetter, resumeName, resumeUrl, resumeVideoName, resumeVideoUrl });

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
        companyId: job.postedBy,
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


