"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.planCancellation = exports.PremiumDetailsOfActiveUser = exports.findSubscriptionById = exports.verifySubscription = exports.createSubscription = void 0;
const SubscriptionSchema_1 = require("./../../model/SubscriptionSchema");
const stripe_1 = __importDefault(require("stripe"));
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const CompanySchema_1 = require("../../model/CompanySchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../../Utils/errorHandler");
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const stripe = new stripe_1.default(process.env.STRIPE_KEY || "");
    const { plan, price, features } = req.body;
    const type = req.user && req.user.type;
    console.log("type", type);
    let userId = type === "User" ? (_a = req.user) === null || _a === void 0 ? void 0 : _a.id : null;
    let companyId = type === "Company" ? (_b = req.user) === null || _b === void 0 ? void 0 : _b.id : null;
    if (!features) {
        res.status(404).json({ success: false, message: "not found features" });
        return;
    }
    console.log("userId", userId);
    console.log("companyId", companyId);
    if (!userId && !companyId) {
        throw new errorHandler_1.CustomError("Either userId or companyId must be provided.", 401);
    }
    if (userId && companyId) {
        throw new errorHandler_1.CustomError("Only one of userId or companyId should be provided.", 400);
    }
    const route = userId ? "user" : "company";
    console.log("route", route);
    console.log("plan", plan);
    const amountInINR = price * 100;
    const featuresString = features === null || features === void 0 ? void 0 : features.join(",");
    const session = yield stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        ui_mode: "embedded",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: plan,
                        description: `Features: ${featuresString}`,
                    },
                    unit_amount: amountInINR,
                },
                quantity: 1,
            },
        ],
        return_url: `${process.env.CLIENT_URL}/${route}/premium/verification/?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
            userId: userId || "",
            companyId: companyId || "",
            features: featuresString || "",
        },
    });
    if (!session.id) {
        throw new errorHandler_1.CustomError("session id not found", 404);
    }
    let setType = userId
        ? "UserSubscription"
        : "CompanySubscription";
    const getEndDate = (plan) => {
        const startDate = new Date();
        switch (plan.toLowerCase()) {
            case "one month":
                return new Date(startDate.setMonth(startDate.getMonth() + 1));
            case "six month":
                return new Date(startDate.setMonth(startDate.getMonth() + 6));
            case "one year":
                return new Date(startDate.setMonth(startDate.getMonth() + 12));
            default:
                throw new errorHandler_1.CustomError("Invalid subscription plan", 400);
        }
    };
    let subscription = yield SubscriptionSchema_1.SubscriptionPlan.findOne({
        $or: [{ userId }, { companyId }],
    });
    subscription = new SubscriptionSchema_1.SubscriptionPlan({
        userId: userId || null,
        companyId: companyId || null,
        plan: plan,
        price: price,
        active: true,
        paymentStatus: "pending",
        type: setType,
        sessionId: session.id,
        startDate: new Date(),
        endDate: getEndDate(plan)
    });
    console.log("subscription.endDate", subscription.endDate);
    yield subscription.save();
    console.log("subscription.endDate saved", subscription.endDate);
    subscription.features = featuresString;
    yield subscription.save();
    res.status(200).json({
        clientSecret: session.client_secret,
        url: session.url,
    });
});
exports.createSubscription = createSubscription;
//verification
const verifySubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const subscription = yield SubscriptionSchema_1.SubscriptionPlan.findOne({ sessionId });
    if (!subscription) {
        res.status(404).json({ success: false, message: "Payment not found" });
        return;
    }
    console.log("subscription", subscription);
    let accountInfo = null;
    let accountType = "";
    console.log("subscription.userId", subscription.userId);
    console.log("subscription.companyId", subscription.companyId);
    if (subscription.type === "UserSubscription" && subscription.userId) {
        accountInfo = yield UserSchema_1.default.findById(subscription.userId);
        accountType = "user";
    }
    else if (subscription.type === "CompanySubscription" &&
        subscription.companyId) {
        accountInfo = yield CompanySchema_1.Company.findById(subscription.companyId);
        accountType = "company";
    }
    if (!accountInfo) {
        res.status(404).json({ success: false, message: "User or Company not found" });
        return;
    }
    console.log("accountInfo", accountInfo);
    if (subscription.paymentStatus === "completed") {
        res.status(404).json({ success: false, message: "Payment has already been processed" });
        return;
    }
    const startDate = new Date();
    subscription.paymentStatus = "completed";
    const getEndDate = (plan) => {
        const startDate = new Date();
        switch (plan === null || plan === void 0 ? void 0 : plan.toLowerCase()) {
            case "one month":
                return new Date(startDate.setMonth(startDate.getMonth() + 1));
            case "six month":
                return new Date(startDate.setMonth(startDate.getMonth() + 6));
            case "one year":
                return new Date(startDate.setMonth(startDate.getMonth() + 12));
            default:
                throw new errorHandler_1.CustomError("Invalid subscription plan", 400);
        }
    };
    const plan = subscription === null || subscription === void 0 ? void 0 : subscription.plan;
    subscription.startDate = startDate;
    subscription.endDate = getEndDate(plan);
    accountInfo.subscriptionStartDate = startDate;
    accountInfo.subscriptionEndDate = getEndDate(plan);
    accountInfo.role = "premium";
    yield accountInfo.save();
    yield subscription.save();
    console.log("accountInfo", accountInfo);
    const payload = {
        userId: accountInfo._id,
        email: accountInfo.email,
    };
    const durationDays = accountInfo.subscriptionEndDate && accountInfo.subscriptionStartDate
        ? (accountInfo.subscriptionEndDate.getTime() - accountInfo.subscriptionStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
        : 1;
    console.log("Duration (days):", durationDays);
    const secretKey = process.env.USER_SECRETKEY;
    if (!secretKey) {
        res.status(500).json({ success: false, message: "Secret key is missing" });
        return;
    }
    const expiresIn = Math.floor(durationDays * 24 * 60 * 60);
    const subscriptionToken = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn });
    if (!subscriptionToken) {
        res.status(400).json({ success: false, message: "Error creating subscription token" });
        return;
    }
    res.cookie("subscriptionToken", subscriptionToken, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: durationDays * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, subscription, accountInfo, accountType });
});
exports.verifySubscription = verifySubscription;
const findSubscriptionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ddddsdasdfdssd");
    const { sessionId } = req.params;
    if (!sessionId) {
        res.status(404).json({ success: false, message: "sessionId not found" });
        return;
    }
    const subscription = yield SubscriptionSchema_1.SubscriptionPlan.findOne({ sessionId: sessionId });
    if (!subscription) {
        res.status(404).json({ success: false, message: "Subscription plan not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Completed", subscription });
});
exports.findSubscriptionById = findSubscriptionById;
const PremiumDetailsOfActiveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const subscription = yield SubscriptionSchema_1.SubscriptionPlan.find({ userId: userId });
    if (!subscription) {
        throw new errorHandler_1.CustomError("subscription user not found", 404);
    }
    res.status(200).json({ status: true, message: "subscription details", subscription });
});
exports.PremiumDetailsOfActiveUser = PremiumDetailsOfActiveUser;
const planCancellation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            throw new errorHandler_1.CustomError("Session ID is required", 400);
        }
        const subscription = yield SubscriptionSchema_1.SubscriptionPlan.findOne({ sessionId });
        if (!subscription) {
            throw new errorHandler_1.CustomError("Subscription not found", 404);
        }
        if (subscription.paymentStatus !== "completed") {
            res.status(400).json({ success: false, message: "Cannot cancel an unpaid or already canceled plan." });
            return;
        }
        let accountInfo = null;
        if (subscription.type === "UserSubscription" && subscription.userId) {
            accountInfo = yield UserSchema_1.default.findById(subscription.userId);
        }
        else if (subscription.type === "CompanySubscription" && subscription.companyId) {
            accountInfo = yield CompanySchema_1.Company.findById(subscription.companyId);
        }
        if (!accountInfo) {
            throw new errorHandler_1.CustomError("User or Company not found", 404);
        }
        subscription.paymentStatus = "cenceled";
        subscription.active = false;
        yield subscription.save();
        accountInfo.role = subscription.type === "UserSubscription" ? "user" : "company";
        accountInfo.subscriptionStartDate = null;
        accountInfo.subscriptionEndDate = null;
        yield accountInfo.save();
        res.clearCookie("subscriptionToken");
        res.status(200).json({
            success: true,
            message: "Subscription cancelled successfully.",
            subscription,
        });
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});
exports.planCancellation = planCancellation;
