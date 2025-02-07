import express  from "express";
import { errorCatch } from "../../middleware/tryCatch";
import { login, logout } from "../../Controller/admin/Login";
import { adminAuthentication } from "../../middleware/adminAuthentication";

const adminRoutes = express.Router()

adminRoutes
 .post("/login",errorCatch(login))
 .post("/logout",adminAuthentication,errorCatch(logout))



 export {adminRoutes}