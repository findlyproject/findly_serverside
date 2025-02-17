import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { login, logOut, register } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CompanySchema, LoginSchema } from "../Utils/zodSchema";
import { companyAuthMiddleware } from "../middleware/companyAuthentication";
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

export { companyRouter };
