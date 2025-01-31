import express from "express";
import { RegistrationUser } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
const router = express.Router()

router
.post("/registration",RegistrationUser)
.post("/emailus", EmailUs)

       
export {router}