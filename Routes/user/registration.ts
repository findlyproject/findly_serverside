import express from "express";
import { RegistrationUser } from "../../Controller/User/Registration";
const router = express.Router()

router
.post("/registration",RegistrationUser)

       
export {router}