import express from "express";
import { login, logout } from "../Controller/authController/admin";
import { adminAuthentication } from "../middleware/adminAuthentication";
import { validateData } from "../middleware/zodValidation";
import { IdSchema, LoginSchema } from "../Utils/zodSchema";
import { allUsers, blockAndUnblock } from "../Controller/userController/admin";
import { deletePost, dismissReports, getReports } from "../Controller/postController/admin";
import { errorCatch } from "../middleware/tryCatch";
const adminRouter = express.Router();

adminRouter
//auth
  .post("/login", validateData(LoginSchema), errorCatch(login))
  .post("/logout", adminAuthentication, errorCatch(logout))

  //user
  .patch(
    "/blockandunblock/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(blockAndUnblock)
  )
  .get("/users", adminAuthentication, errorCatch(allUsers))

  //report
  .get("/viewreports", adminAuthentication, errorCatch(getReports))
  .post(
    "/dismissreports/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(dismissReports)
  )

  //post
  .delete(
    "/deletepost/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(deletePost)
  );

export { adminRouter };
