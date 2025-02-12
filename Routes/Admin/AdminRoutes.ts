import express  from "express";
import { errorCatch } from "../../middleware/tryCatch";
import Login from "../../Controller/admin/Login";
import { adminAuthentication } from "../../middleware/adminAuthentication";

const adminRoutes = express.Router()

adminRoutes
 .post("/login",errorCatch(Login.login))
 .post("/logout",adminAuthentication,errorCatch(Login.logout))
 .patch("/blockandunblock/:id",adminAuthentication,errorCatch(Login.blocAndUnblock))

 export {adminRoutes}