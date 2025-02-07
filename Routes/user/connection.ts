import Express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { acceptconnectionrequest, getconnection, removeConnection, userconnections } from "../../Controller/User/Connecting";

const connectionrout = Express.Router()

connectionrout

    .post("/conectting/:id",userAuthMiddleware,errorCatch(userconnections))
    .post("/acceptconnectionrequest/:id",userAuthMiddleware,errorCatch(acceptconnectionrequest))
    .get("/getconnection",userAuthMiddleware,errorCatch(getconnection))
    .post("/removeconnection/:id",userAuthMiddleware,errorCatch(removeConnection))




    export{connectionrout}