import { Request, Response } from "express";
import User from "../model/UserSchema";
import { CustomError } from "../Utils/errorHandler";
import { JobPost } from "../model/JobSchema";
import { Company } from "../model/CompanySchema";


export const UserSearch = async (req: Request, res: Response): Promise<void> => {
  const { firstName } = req.query;

  if (!firstName) {
    throw new CustomError("Search term is required", 400);
  }

  const users = await User.find({
    firstName: { $regex: `^${firstName}`, $options: "i" },
  }).lean(); 

  const formattedUsers = users.map(user => ({
    ...user,
    type: "User",
  }));

  // Fetch companies and add type field
  const companies = await Company.find({
    name: { $regex: `^${firstName}`, $options: "i" },
  }).lean();

  const formattedCompanies = companies.map(company => ({
    ...company,
    type: "Company", // Add type field
  }));

  // Combine results
  const results = [...formattedUsers, ...formattedCompanies];

  res.status(200).json({ status: true, message: "Search results", results });
};



export const jobSearch = async (req: Request, res: Response): Promise<void> => {
  const { jobName, location } = req.query;

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



