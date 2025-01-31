import express from "express";
import { RegistrationUser } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
import { errorCatch } from "../../Middleware/tryCatch";
const router = express.Router()

router
.post("/registration",errorCatch(RegistrationUser))
.post("/emailus",errorCatch(EmailUs))

       
export {router}