import Express from "express";
import { userAuthMiddleware } from "../../middleware/userauthantication";
// import { errorCatch } from "../../Middleware/tryCatch";
import { errorCatch } from "../../middleware/tryCatch";
import { getconnection, removeConnection, userconnections } from "../../Controller/User/Connecting";

const connectionrout = Express.Router()

connectionrout

    .post("/conectting/:id",userAuthMiddleware,errorCatch(userconnections))
    .get("/getconnection",userAuthMiddleware,errorCatch(getconnection))
    .post("/removeconnection/:id",userAuthMiddleware,errorCatch(removeConnection))




    export{connectionrout}