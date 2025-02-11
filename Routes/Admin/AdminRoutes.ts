import express  from "express";
import { errorCatch } from "../../middleware/tryCatch";
import { login } from "../../Controller/admin/Login";
import { AllUsers } from "../../Controller/User/Registration";
const adminRoutes = express.Router()

adminRoutes
 .post("/login",errorCatch(login))
 .get("/users",errorCatch(AllUsers))


 export {adminRoutes}