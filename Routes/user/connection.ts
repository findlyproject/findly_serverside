import Express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { userconnections } from "../../Controller/User/Connecting";

const connectionrout = Express.Router()

connectionrout

    .post("/connecttootheruser/:id",userAuthMiddleware,errorCatch(userconnections))


    export{connectionrout}