import { Request, Response } from "express"
import { Report } from "../../model/ReportSchema"
import { CustomError } from "../../Utils/errorHandler"


export const GetAllReportsOfPosts = async (req: Request, res: Response): Promise<void> => {
    const postReports = await Report.find({ isDeleted: false, postId: { $exists: true, $ne: null } })
      .populate('reportedBy postId');
    res.status(200).json({
      status: true,
      message: 'All reports of posts fetched successfully.',
      postReports,
    });
  };
  



  export const GetAllReportsOfUsers = async (req: Request, res: Response): Promise<void> => {
    const userReports = await Report.find({ isDeleted: false, userId: { $exists: true, $ne: null } })
      .populate('reportedBy userId');
    res.status(200).json({
      status: true,
      message: 'All reports of users fetched successfully.',
      userReports,
    });
  };
  