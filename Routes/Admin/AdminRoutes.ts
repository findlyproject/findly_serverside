import express  from "express";
import { errorCatch } from "../../middleware/tryCatch";
import Login from "../../Controller/admin/Login";
import { adminAuthentication } from "../../middleware/adminAuthentication";
import {blocAndUnblock,allUsers,getReports,dismissReports,deletePost} from '../../Controller/admin/actions'
const adminRoutes = express.Router()

adminRoutes
 .post("/login",errorCatch(Login.login))
 .post("/logout",adminAuthentication,errorCatch(Login.logout))
 .patch("/blockandunblock/:id",adminAuthentication,errorCatch(blocAndUnblock))
 .get("/users",adminAuthentication,errorCatch(allUsers))

 
.get('/viewreports',adminAuthentication,errorCatch(getReports))
.post('/dismissreports/:id',adminAuthentication,errorCatch(dismissReports))
.delete('/deletepost/:id',adminAuthentication,errorCatch(deletePost))


 export {adminRoutes}