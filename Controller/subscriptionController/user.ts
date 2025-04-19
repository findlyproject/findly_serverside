import { SubscriptionPlan } from './../../model/SubscriptionSchema';
import { subscription } from './../../../findly_clientside/src/lib/store/features/actions/subscriptionActions';
import { Request, Response } from "express";
import Stripe from "stripe";

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
  const type=req.user &&req.user.type
  console.log("type",type);
  
  let userId = type==="User"?req.user?.id:null
  let companyId =type==="Company"?req.user?.id:null
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
const route=userId?"user":"company"
console.log("route",route);
console.log("plan",plan);

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

    return_url: `${process.env.CLIENT_URL}/${route}/premium/verification/?session_id={CHECKOUT_SESSION_ID}`,

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



    const getEndDate = (plan: string): Date => {
      const startDate = new Date();
      switch (plan.toLowerCase()) {
        case "one month":
          return new Date(startDate.setMonth(startDate.getMonth() + 1));
        case "six month":
          return new Date(startDate.setMonth(startDate.getMonth() + 6));
        case "one year":
          return new Date(startDate.setMonth(startDate.getMonth() + 12));
        default:
          throw new CustomError("Invalid subscription plan", 400);
      }
    };
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
    endDate: getEndDate(plan)
  });
  console.log("subscription.endDate",subscription.endDate);
  

  await subscription.save();
  console.log("subscription.endDate saved",subscription.endDate);
  subscription.features = featuresString;
  await subscription.save();
  res.status(200).json({
    clientSecret: session.client_secret,
    url: session.url,
  });
};

//verification
export const verifySubscription = async (req: Request, res: Response) => {
  console.log("hello working");
  
  const { sessionId } = req.params;
  const subscription = await SubscriptionPlan.findOne({ sessionId });
  if (!subscription) {
    throw new CustomError("Payment not found", 404);
  }

  console.log("subscription",subscription);
  
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
console.log("accountInfo",accountInfo);

  if (subscription.paymentStatus === "completed") {
     res.status(404).json({success:false,message:"Payment has already been processed"})
     return

  }

  const startDate = new Date();
  subscription.paymentStatus = "completed";
 

  const getEndDate = (plan: string|undefined): Date => {
    const startDate = new Date();
    switch (plan?.toLowerCase()) {
      case "one month":
        return new Date(startDate.setMonth(startDate.getMonth() + 1));
      case "six month":
        return new Date(startDate.setMonth(startDate.getMonth() + 6));
      case "one year":
        return new Date(startDate.setMonth(startDate.getMonth() + 12));
      default:
        throw new CustomError("Invalid subscription plan", 400);
    }
  };
  const plan=subscription?.plan
  subscription.startDate=startDate
  subscription.endDate=getEndDate(plan)

  accountInfo.subscriptionStartDate = startDate;
  accountInfo.subscriptionEndDate = getEndDate(plan)
  accountInfo.role = "premium";
  
  await accountInfo.save();
  await subscription.save();
console.log("accountInfo",accountInfo);

 
const payload = {   
  userId: accountInfo._id,
  email: accountInfo.email,
};

const durationDays =
  accountInfo.subscriptionEndDate && accountInfo.subscriptionStartDate
    ? (accountInfo.subscriptionEndDate.getTime() - accountInfo.subscriptionStartDate.getTime()) /
      (1000 * 60 * 60 * 24)
    : 1; 

console.log("Duration (days):", durationDays);

const secretKey = process.env.USER_SECRETKEY;
if (!secretKey) throw new CustomError("Secret key is missing", 500);

const expiresIn=durationDays

const subscriptionToken = jwt.sign(payload, secretKey, { expiresIn });

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
  console.log("ddddsdasdfdssd");
  
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




export const PremiumDetailsOfActiveUser=async(req:Request,res:Response):Promise<void>=>{
  const userId=req.user?.id
  const subscription=await SubscriptionPlan.find({userId:userId})
  if(!subscription){
    throw new CustomError("subscription user not found",404)


  }
res.status(200).json({status:true,message:"subscription details",subscription})
}