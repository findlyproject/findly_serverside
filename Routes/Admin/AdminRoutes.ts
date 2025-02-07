import express  from "express";
import { errorCatch } from "../../Middleware/tryCatch";
import { login } from "../../Controller/admin/Login";

const adminRoutes = express.Router()

adminRoutes
 .post("/login",errorCatch(login))


 export {adminRoutes}