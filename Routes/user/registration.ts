import express from "express";
<<<<<<< HEAD
import { login, RegistrationUser } from "../../Controller/User/Registration";
=======
import { RegistrationUser } from "../../Controller/User/Registration";
import { EmailUs } from "../../Controller/User/ContactUs";
>>>>>>> 479409c47c38a5679b84c05eee3d49c42adc6510
const router = express.Router()

router
.post("/registration",RegistrationUser)
<<<<<<< HEAD
.post("/login",login)

=======
.post("/emailus",EmailUs)
>>>>>>> 479409c47c38a5679b84c05eee3d49c42adc6510

       
export {router}