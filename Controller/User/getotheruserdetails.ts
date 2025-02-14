import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Report } from "../../model/ReportSchema";
import { IUser } from "../../types/allTypes";


const getauteruserdetails = async (req:Request,res:Response)=>{
    const userid = req.params.id;
    
}

//////////////////// REPORT USER ////////////

const reportuser = async(req:Request,res:Response):Promise<void>=>{
    const userid = req.user?.id;
    const { reason, repoteduserid } = req.body;

    if (!userid) {
        res.status(400).json({ status: false, message: "User ID is missing" });
        return;
    }
    

    const finduser = await User.findOne({ _id: userid });
    if (!finduser) {
        res.status(404).json({ status: false, message: "User not found" });
        return;
    }

    if (!repoteduserid) {
        res.status(400).json({ status: false, message: "Reported user ID is missing" });
        return;
    }

    const findreporteduser = await User.findOne({ _id: repoteduserid }).populate("reports");

    if (!findreporteduser) {
        res.status(404).json({ status: false, message: "Reported user not found" });
        return;
    }

    const report = new Report({
        reportedBy: userid,
        reason,
    });
    await report.save();

    if (!Array.isArray(findreporteduser.reports)) {
        findreporteduser.reports = [];
    }           

    findreporteduser.reports.push(report.id);
    const a = await findreporteduser.save();
    const popuatedreports = await User.findOne({ _id: repoteduserid }).populate("reports");
 
    res.status(200).json({ status: true, message: "Reported successfully", popuatedreports });
}
export {
    getauteruserdetails,
    reportuser
}