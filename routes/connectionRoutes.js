"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRouter = void 0;
const express_1 = __importDefault(require("express"));
const userauthantication_1 = require("../middleware/userauthantication");
const tryCatch_1 = require("../middleware/tryCatch");
const user_1 = require("../Controller/ConnectingController/user");
const zodValidation_1 = require("../middleware/zodValidation");
const zodSchema_1 = require("../Utils/zodSchema");
const connectionRouter = express_1.default.Router();
exports.connectionRouter = connectionRouter;
connectionRouter
    .post("/request/:id", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.userconnections))
    .post("/accept/:id", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.acceptconnectionrequest))
    .get("/getconnection", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.getconnection))
    .post("/removeconnection/:id", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.removeConnection))
    .get("/connectionrequest", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.GetConnectionRequest))
    .post("/ignore/:id", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.connectingSchema), (0, tryCatch_1.errorCatch)(user_1.ignoreConnectionRequest));
