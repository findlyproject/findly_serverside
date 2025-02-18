import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { initialRegister,verifyOTP,finalRegister } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CompanySchema } from "../Utils/zodSchema";    
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
    validateData(CompanySchema),
    upload.single("logo"),
    errorCatch(finalRegister)
  )

export { companyRouter };
