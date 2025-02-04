import Express from "express";
import { userAuthMiddleware } from "../../Middleware/userauthantication";
import { errorCatch } from "../../Middleware/tryCatch";
import { userconnections } from "../../Controller/User/Connecting";

const connectionrout = Express.Router()

connectionrout

    .post("/connecttootheruser/:id",userAuthMiddleware,errorCatch(userconnections))


    export{connectionrout}