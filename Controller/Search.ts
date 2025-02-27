import { Request, Response } from "express";
import User from "../model/UserSchema";
import { CustomError } from "../Utils/errorHandler";
import { JobPost } from "../model/JobSchema";

export const UserSearch = async (req: Request, res: Response): Promise<void> => {
  const { firstName } = req.query;
console.log("firstName",firstName);
console.log("req.query",req.query);

  if (!firstName) {
    throw new CustomError("Search term is required", 400);
  }

  const users = await User.find({
    firstName: { $regex: `^${firstName}`, $options: "i" },
  });

  res.status(200).json({ status: true, message: "search results", users });
};



export const jobSearch = async (req: Request, res: Response): Promise<void> => {
  const { jobName, location } = req.query;

  console.log("jobName:", jobName);
  console.log("location:", location);
  console.log("req.query:", req.query);

  if (!jobName && !location) {
    throw new CustomError("At least one search term is required", 400);
  }
   
  
 interface queryType{
  title?: { $regex: string; $options: string };
  location?: { $regex: string; $options: string };
 }
  const query :queryType= {};
  if (jobName) {
    query.title = { $regex: `^${jobName}`, $options: "i" };
  }
  if (location) {
    query.location = { $regex: `^${location}`, $options: "i" };
  }

  const jobs = await JobPost.find(query);


  res.status(200).json({ success: true, message: "Search results", jobs });
};



