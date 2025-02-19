import { Request, Response } from "express";
import Stripe from "stripe";
import { SubscriptionPlan } from "../../model/SubscriptionSchema";
import User from "../../model/UserSchema";
import { Company } from "../../model/CompanySchema";
import jwt from "jsonwebtoken";
import { CustomError } from "../../Utils/errorHandler";


export const createSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const stripe = new Stripe(process.env.STRIPE_KEY || "");

  
  const { plan, price, features } = req.body;
  let userId = req.user?.id;
  let companyId = req.company?.id;
  if (!features) {
    res.status(404).json({ success: false, message: "not found features" });
    return;
  }

  console.log("userId",userId);
  console.log("companyId",companyId);
  
  if (!userId && !companyId) {
    throw new CustomError("Either userId or companyId must be provided.", 401);
  }
  if (userId && companyId) {
    throw new CustomError(
      "Only one of userId or companyId should be provided.",
      400
    );
  }

  const amountInINR = price * 100;

  const featuresString = features?.join(",");

  const session = await stripe.checkout.sessions.create({
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

    return_url: `${process.env.CLIENT_URL}/premium/verification/?session_id={CHECKOUT_SESSION_ID}`,

    metadata: {
      userId: userId || "",
      companyId: companyId || "",
      features: featuresString || "",
    },
  });
  if (!session.id) {
    throw new CustomError("session id not found", 404);
  }
  let setType: "UserSubscription" | "CompanySubscription" = userId
    ? "UserSubscription"
    : "CompanySubscription";

  let subscription = await SubscriptionPlan.findOne({
    $or: [{ userId }, { companyId }],
  });
  subscription = new SubscriptionPlan({
    userId: userId || null,
    companyId: companyId || null,
    plan: plan,
    price: price,
    active: true,
    paymentStatus: "pending",
    type: setType,
    sessionId: session.id,
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  });

  await subscription.save();

  subscription.features = featuresString;
  await subscription.save();
  res.status(200).json({
    clientSecret: session.client_secret,
    url: session.url,
  });
};

//verification
export const verifySubscription = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const subscription = await SubscriptionPlan.findOne({ sessionId });
  if (!subscription) {
    throw new CustomError("Payment not found", 404);
  }
  let accountInfo = null;
  let accountType = ""; 

  if (subscription.type === "UserSubscription" && subscription.userId) {
    accountInfo = await User.findById(subscription.userId);
    accountType="user"
  } else if (
    subscription.type === "CompanySubscription" &&
    subscription.companyId
  ) {
    accountInfo = await Company.findById(subscription.companyId);
    accountType="company"
  }

  if (!accountInfo) {
    throw new CustomError("User or Company not found", 404);
  }

  if (subscription.paymentStatus === "completed") {
    throw new CustomError("Payment has already been processed", 404);
  }

  const startDate = new Date();
  let durationDays = 0;

  if (subscription.plan === "one month") {
    durationDays = 30;
  } else if (subscription.plan === "six months") {
    durationDays = 180;
  } else if (subscription.plan === "one year") {
    durationDays = 360;
  }

  const endDate = new Date();
  endDate.setDate(startDate.getDate() + durationDays);

  subscription.paymentStatus = "completed";
  await subscription.save();

  accountInfo.subscriptionStartDate = startDate;
  accountInfo.subscriptionEndDate = endDate;  
  accountInfo.role = "premium";

  await accountInfo.save();
console.log("accountInfo",accountInfo);

  const payload = {
    userId: accountInfo._id,
    email: accountInfo.email,
  };

  const secretKey = process.env.USER_SECRETKEY!;
  const subscriptionToken = jwt.sign(payload, secretKey, {
    expiresIn: `${durationDays}d`,
  });

  if (!subscriptionToken) {
    throw new CustomError("Error creating subscription token", 400);
  }

  res.cookie("subscriptionToken", subscriptionToken, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: durationDays * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, subscription, accountInfo,accountType });
};

export const findSubscriptionById = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    res.status(404).json({ success: false, message: "sessionId not found" });
    return;
  }
  const subscription = await SubscriptionPlan.findOne({ sessionId: sessionId });

  if (!subscription) {
    throw new CustomError("Subscription plan not found", 404);
  }

  res.status(200).json({ success: true, message: "Completed", subscription });
};

