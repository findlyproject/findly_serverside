"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSearch = exports.UserSearch = void 0;
const UserSchema_1 = __importDefault(require("../model/UserSchema"));
const errorHandler_1 = require("../Utils/errorHandler");
const JobSchema_1 = require("../model/JobSchema");
const CompanySchema_1 = require("../model/CompanySchema");
// export const UserSearch = async (req: Request, res: Response): Promise<void> => {
//   const { firstName } = req.query;
// console.log("firstName",firstName);
// console.log("req.query",req.query);
//   if (!firstName) {
//     throw new CustomError("Search term is required", 400);
//   }
//   const users = await User.find({
//     firstName: { $regex: `^${firstName}`, $options: "i" },
//   });
//   const companies=await Company.find({
//     name:{$regex:`${firstName}`,$options:"i"}
//   })
//   console.log("companies",companies);
//   const results = [...users, ...companies];
//   res.status(200).json({ status: true, message: "search results", results });
// };
const UserSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName } = req.query;
    if (!firstName) {
        throw new errorHandler_1.CustomError("Search term is required", 400);
    }
    // Fetch users and add type field
    const users = yield UserSchema_1.default.find({
        firstName: { $regex: `^${firstName}`, $options: "i" },
    }).lean(); // Converts Mongoose documents to plain objects
    const formattedUsers = users.map(user => (Object.assign(Object.assign({}, user), { type: "User" })));
    // Fetch companies and add type field
    const companies = yield CompanySchema_1.Company.find({
        name: { $regex: `^${firstName}`, $options: "i" },
    }).lean();
    const formattedCompanies = companies.map(company => (Object.assign(Object.assign({}, company), { type: "Company" })));
    // Combine results
    const results = [...formattedUsers, ...formattedCompanies];
    res.status(200).json({ status: true, message: "Search results", results });
});
exports.UserSearch = UserSearch;
const jobSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobName, location } = req.query;
    console.log("jobName:", jobName);
    console.log("location:", location);
    console.log("req.query:", req.query);
    if (!jobName && !location) {
        throw new errorHandler_1.CustomError("At least one search term is required", 400);
    }
    const query = {};
    if (jobName) {
        query.title = { $regex: `^${jobName}`, $options: "i" };
    }
    if (location) {
        query.location = { $regex: `^${location}`, $options: "i" };
    }
    const jobs = yield JobSchema_1.JobPost.find(query);
    res.status(200).json({ success: true, message: "Search results", jobs });
});
exports.jobSearch = jobSearch;
