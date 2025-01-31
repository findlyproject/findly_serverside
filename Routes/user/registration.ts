import express from "express";
import { demo, login, logout, RegistrationUser } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../Middleware/tryCatch";
import { userAuthMiddleware } from "../../Middleware/userauthantication";
const router = express.Router()

router
.post("/registration", errorCatch(RegistrationUser))
.post("/login",errorCatch(login))
.post("/logout",userAuthMiddleware,errorCatch(logout))
.post("/demo",userAuthMiddleware,errorCatch(demo))


.post("/emailus",userAuthMiddleware,errorCatch(EmailUs))
       
export {router}