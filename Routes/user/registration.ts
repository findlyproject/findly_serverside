import express from "express";
import { login, RegistrationUser } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
const router = express.Router()

router
.post("/registration",RegistrationUser)
.post("/login",login)

.post("/emailus",EmailUs)

       
export {router}