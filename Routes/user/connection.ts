import Express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { acceptconnectionrequest, getconnection, removeConnection, userconnections,GetConnectionRequest,ignoreConnectionRequest } from "../../Controller/User/Connecting";

const connectionrout = Express.Router()

connectionrout

    .post("/request/:id",userAuthMiddleware,errorCatch(userconnections))  
    .post("/accept/:id",userAuthMiddleware,errorCatch(acceptconnectionrequest))
    .get("/getconnection",userAuthMiddleware,errorCatch(getconnection))
    .post("/removeconnection/:id",userAuthMiddleware,errorCatch(removeConnection))
     .get("/connectionrequest",userAuthMiddleware,errorCatch(GetConnectionRequest))
     .post("/ignore/:id",userAuthMiddleware,errorCatch(ignoreConnectionRequest))



    export{connectionrout}