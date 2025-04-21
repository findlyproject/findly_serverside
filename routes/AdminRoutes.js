"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_1 = require("../Controller/authController/admin");
const adminAuthentication_1 = require("../middleware/adminAuthentication");
const zodValidation_1 = require("../middleware/zodValidation");
const zodSchema_1 = require("../Utils/zodSchema");
const admin_2 = require("../Controller/userController/admin");
const admin_3 = require("../Controller/postController/admin");
const tryCatch_1 = require("../middleware/tryCatch");
const upload_1 = require("../middleware/upload");
const admin_4 = require("../Controller/ratingController/admin");
const admin_5 = require("../Controller/reportController/admin");
const user_1 = require("../Controller/userController/user");
const company_1 = require("../Controller/userController/company");
// import { getAllPosts } from "../Controller/postController/user";
const adminRouter = express_1.default.Router();
exports.adminRouter = adminRouter;
adminRouter
    //auth
    .post("/login", (0, zodValidation_1.validateData)(zodSchema_1.LoginSchema), (0, tryCatch_1.errorCatch)(admin_1.login))
    .post("/logout", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_1.logout))
    .get("/findallposts", (0, tryCatch_1.errorCatch)(admin_3.getAllPosts))
    //user
    .patch("/blockandunblock/:id", adminAuthentication_1.adminAuthentication, (0, zodValidation_1.validateData)(undefined, zodSchema_1.IdSchema), (0, tryCatch_1.errorCatch)(admin_2.blockAndUnblock))
    .get("/users", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.allUsers))
    .get("/companies", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.allCompanies))
    //report
    .get("/viewreports", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_3.getReports))
    .post("/dismissreports/:id", (0, tryCatch_1.errorCatch)(admin_3.dismissReports))
    //post 
    .patch("/deletepost/:id", (0, tryCatch_1.errorCatch)(admin_3.deletePost))
    .get("/findallposts", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_3.getAllPosts))
    //editprofile
    .patch("/editprofile", adminAuthentication_1.adminAuthentication, upload_1.upload.single("profileImage"), (0, tryCatch_1.errorCatch)(admin_1.ProfileEdit))
    //daily users
    .get("/dailyusers", admin_2.getDailyUsers)
    //daily revenue
    .get("/dailyrevenue", admin_2.getDailyRevenue)
    //create skills
    .post("/addskill", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.createSkills))
    .get("/allskills", (0, tryCatch_1.errorCatch)(admin_2.AllSkills))
    .patch("/removeskill/:id", (0, tryCatch_1.errorCatch)(admin_2.RemoveSkills))
    .patch("/editskill/:id", (0, tryCatch_1.errorCatch)(admin_2.EditSkill))
    .patch("/approveskill/:id", (0, tryCatch_1.errorCatch)(admin_2.ApproveSkill))
    //create titles
    .post("/addtitle", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.createTitles))
    .post("/titlebyuser", (0, tryCatch_1.errorCatch)(admin_2.createTitlesbyUser))
    .get("/alltitle", (0, tryCatch_1.errorCatch)(admin_2.AllTitles))
    .patch("/removetitle/:titleid", (0, tryCatch_1.errorCatch)(admin_2.RemoveTitle))
    .patch("/edittitle/:id", (0, tryCatch_1.errorCatch)(admin_2.EditTitle))
    .patch("/approvetitle/:id", (0, tryCatch_1.errorCatch)(admin_2.ApproveTitle))
    //daily users
    .get("/dailyusers", admin_2.getDailyUsers)
    //total user revenue
    .get("/userrevenue", admin_2.getTotalUserRevenue)
    //daily companies
    .get("/dailycompanies", admin_2.getDailyCompanies)
    //daily revenue
    .get("/dailyrevenue", admin_2.getDailyRevenue)
    //total company revenue
    .get("/companyrevenue", admin_2.getTotalCompanyRevenue)
    //total revenue
    .get("/totalrevenue", (0, tryCatch_1.errorCatch)(admin_2.getTotalRevenue))
    //chart
    .get("/new", (0, tryCatch_1.errorCatch)(admin_2.getDailycompany))
    .get("/dailyuser", (0, tryCatch_1.errorCatch)(admin_2.getDailyuser))
    //create skills
    .post("/addskill", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.createSkills))
    .get("/allskills", (0, tryCatch_1.errorCatch)(admin_2.AllSkills))
    .patch("/removeskill/:id", (0, tryCatch_1.errorCatch)(admin_2.RemoveSkills))
    .patch("/editskill/:id", (0, tryCatch_1.errorCatch)(admin_2.EditSkill))
    .patch("/approveskill/:id", (0, tryCatch_1.errorCatch)(admin_2.ApproveSkill))
    //create titles
    .post("/addtitle", adminAuthentication_1.adminAuthentication, (0, tryCatch_1.errorCatch)(admin_2.createTitles))
    .post("/titlebyuser", (0, tryCatch_1.errorCatch)(admin_2.createTitlesbyUser))
    .get("/alltitle", (0, tryCatch_1.errorCatch)(admin_2.AllTitles))
    .patch("/removetitle/:titleid", (0, tryCatch_1.errorCatch)(admin_2.RemoveTitle))
    .patch("/edittitle/:id", (0, tryCatch_1.errorCatch)(admin_2.EditTitle))
    .patch("/approvetitle/:id", (0, tryCatch_1.errorCatch)(admin_2.ApproveTitle))
    .get("/alladmin", (0, tryCatch_1.errorCatch)(admin_2.AllTitlesAdmin))
    //remove rating
    //remove rating
    .patch("/remove/:id", (0, tryCatch_1.errorCatch)(admin_4.deleteRating))
    .patch("/approve/:id", (0, tryCatch_1.errorCatch)(admin_4.approveRating))
    .get("/ratings", (0, tryCatch_1.errorCatch)(admin_4.getRatings))
    //reports
    .get(`/post`, (0, tryCatch_1.errorCatch)(admin_5.GetAllReportsOfPosts))
    .get(`/user`, (0, tryCatch_1.errorCatch)(admin_5.GetAllReportsOfUsers))
    //User details
    .get(`/user/:id`, (0, tryCatch_1.errorCatch)(user_1.spacificuserdetails))
    //company details
    .get(`/company/:companyId`, (0, tryCatch_1.errorCatch)(company_1.spacificCompanyDetails))
    .patch(`/block/:id`, (0, tryCatch_1.errorCatch)(admin_2.BlockCompany))
    .get('/sevendays', (0, tryCatch_1.errorCatch)(admin_2.getLast7DaysRevenue));
