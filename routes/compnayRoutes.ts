import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { initialRegister,verifyOTP,finalRegister,login, logOut, } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CompanySchema, jobPostSchema, LoginSchema } from "../Utils/zodSchema";
import { companyAuthMiddleware } from "../middleware/companyAuthentication";
import { createJobPost, deleteJobPost, findAppliedUsers, findUserApplication, getAllJobPost, getJobsById, updateJobPost } from "../Controller/jobController/company";
import { companyAuth, userAuthMiddleware } from "../middleware/userauthantication";
const companyRouter = express.Router();

companyRouter

  //auth
    
  .post(
    "/send-otp",
    // validateData(CompanySchema),
    errorCatch(initialRegister)
  )
  .post(
    "/verify-otp",
    errorCatch(verifyOTP)
  )
  .post(
    "/final-register",
    // validateData(CompanySchema),
    upload.single("logo"),
    errorCatch(finalRegister)
  )
  .post("/login",validateData(LoginSchema),errorCatch(login))
  .post("/logout",companyAuth, errorCatch(logOut))
  .post("/jobposting",companyAuthMiddleware,validateData(jobPostSchema),errorCatch(createJobPost))
  .patch("/updatejobs/:jobId",companyAuthMiddleware,errorCatch(updateJobPost))
  .delete("/deletejobpost/:jobId",companyAuthMiddleware,errorCatch(deleteJobPost))
  .get("/getalljobs",userAuthMiddleware,errorCatch(getAllJobPost))
  .get("/getJobsById/:id",userAuthMiddleware,errorCatch(getJobsById))
  .get("/findapplications",companyAuthMiddleware,errorCatch(findAppliedUsers))
  .get("/findapplications/:userId/:jobId",companyAuthMiddleware,errorCatch(findUserApplication))


export { companyRouter };
