import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { login, logOut, register } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CompanySchema, jobPostSchema, LoginSchema } from "../Utils/zodSchema";
import { companyAuthMiddleware } from "../middleware/companyAuthentication";
import { createJobPost, updateJobPost } from "../Controller/jobController/company";
const companyRouter = express.Router();

companyRouter

  //auth
  .post(
    "/register",
    validateData(CompanySchema),
    upload.single("logo"),
    errorCatch(register)
  )
  .post("/login",validateData(LoginSchema),errorCatch(login))
  .post("/logout",companyAuthMiddleware, errorCatch(logOut))
  .post("/jobposting",companyAuthMiddleware,validateData(jobPostSchema),errorCatch(createJobPost))
  .patch("/updatejobs/:jobId",companyAuthMiddleware,errorCatch(updateJobPost))

export { companyRouter };
