import Express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { errorCatch } from "../../middleware/tryCatch";
import { acceptconnectionrequest, getconnection, removeConnection, userconnections,GetConnectionRequest,ignoreConnectionRequest } from "../../Controller/User/Connecting";
import { validateData } from "../../middleware/zodValidation";
import { connectingSchema } from "../../Utils/zodSchema";


const connectionroute = Express.Router()

connectionroute

    .post("/request/:id",userAuthMiddleware,validateData(connectingSchema),errorCatch(userconnections))  
    .post("/accept/:id",userAuthMiddleware,validateData(connectingSchema),errorCatch(acceptconnectionrequest))
    .get("/getconnection",userAuthMiddleware,validateData(connectingSchema),errorCatch(getconnection))
    .post("/removeconnection/:id",userAuthMiddleware,validateData(connectingSchema),errorCatch(removeConnection))
     .get("/connectionrequest",userAuthMiddleware,validateData(connectingSchema),errorCatch(GetConnectionRequest))
     .post("/ignore/:id",userAuthMiddleware,validateData(connectingSchema),errorCatch(ignoreConnectionRequest))



    export{connectionroute}