"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const userauthantication_1 = require("../middleware/userauthantication");
const tryCatch_1 = require("../middleware/tryCatch");
const user_1 = require("../Controller/subscriptionController/user");
const zodSchema_1 = require("../Utils/zodSchema");
const zodValidation_1 = require("../middleware/zodValidation");
const paymentRouter = express_1.default.Router();
exports.paymentRouter = paymentRouter;
paymentRouter
    .post("/createSubscription", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.SubscriptionSchema), (0, tryCatch_1.errorCatch)(user_1.createSubscription))
    .post("/verifySubscription/:sessionId", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(undefined, zodSchema_1.VerificationSchema), (0, tryCatch_1.errorCatch)(user_1.verifySubscription))
    .post("/findsubscriptionbyId/:sessionId", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(undefined, zodSchema_1.VerificationSchema), (0, tryCatch_1.errorCatch)(user_1.findSubscriptionById));
