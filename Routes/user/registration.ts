import express from "express";
import { login, RegistrationUser } from "../../Controller/User/Registration";
const router = express.Router()

router
.post("/registration",RegistrationUser)
.post("/login",login)


       
export {router}