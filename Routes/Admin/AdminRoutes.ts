import express from "express";
import { errorCatch } from "../../middleware/tryCatch";
import { login, logout } from "../../Controller/admin/Login";
import { adminAuthentication } from "../../middleware/adminAuthentication";
import {
    blockAndUnblock,
  allUsers,
  getReports,
  dismissReports,
  deletePost,
} from "../../Controller/admin/actions";
import { validateData } from "../../middleware/zodValidation";
import { IdSchema, LoginSchema } from "../../Utils/zodSchema";
const adminRoutes = express.Router();

adminRoutes

  .post("/login", validateData(LoginSchema), errorCatch(login))
  .post("/logout", adminAuthentication, errorCatch(logout))
  .patch(
    "/blockandunblock/:id",
    adminAuthentication,
    validateData(IdSchema),
    errorCatch(blockAndUnblock)
  )
  .get("/users", adminAuthentication, errorCatch(allUsers))

  .get("/viewreports", adminAuthentication, errorCatch(getReports))
  .post(
    "/dismissreports/:id",
    adminAuthentication,
    validateData(IdSchema),
    errorCatch(dismissReports)
  )
  .delete(
    "/deletepost/:id",
    adminAuthentication,
    validateData(IdSchema),
    errorCatch(deletePost)
  );

export { adminRoutes };
