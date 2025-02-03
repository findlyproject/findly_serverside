import { Request, Response } from "express";
import Stripe from "stripe";
import { SubscriptionPlan } from "../../../Model/SubscriptionSchama"; 
import  User  from "../../../Model/UserSchema"; 
import { Company } from "../../../Model/CompanySchema";
import jwt, { JwtPayload } from "jsonwebtoken";import { string } from "zod";

 const createSubscription = async (req: Request, res: Response):Promise<void> => {
    console.log("hellos",process.env.STRIPE_KEY)

    const stripe = new Stripe(process.env.STRIPE_KEY||"");
  const {   planName, price, features, type } = req.body;
  let userId=req.user?.id
//   const companyId=req.company?.id
console.log("userId",userId);


  const companyId=null
  console.log("companyId",companyId);
  

  console.log("userId",userId)
  if(!userId&&!companyId){
    res.status(400).json({success:false, message: "Either userId or companyId must be provided." });
    return
  }
  if (userId && companyId) {
     res.status(400).json({ message: "Only one of userId or companyId should be provided." });
     return
  }


  const amountInINR=price*100
  
    const featuresString=features.join(",")

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        ui_mode: "embedded",
        
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: { name:planName,description: `Features: ${featuresString}`, },
                    unit_amount: amountInINR,
                    
                },
                quantity: 1, 
            },
        ],

        return_url: `${process.env.CLIENT_URL}/success/?session_id={CHECKOUT_SESSION_ID}`,
       
           metadata: {
        userId: userId || "",
        companyId: companyId || "",
        type,
        features: featuresString || "", 
    }
    })
if(!session.id){
    res.status(404).json({success:true,message:"session id not found"})
    return 
}
    let setType: "UserSubscription" | "CompanySubscription" = userId ? "UserSubscription" : "CompanySubscription";

    let subscription = await SubscriptionPlan.findOne({ $or: [{ userId }, { companyId }] });
    console.log("subscription",subscription)

  
        
        subscription = new SubscriptionPlan({
            userId: userId||null,
            companyId:companyId||null,
            plan: planName,
            price: price,
            active: true,
            paymentStatus:"pending",
             type:setType,
             sessionId:session.id,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 
        });
    

    await subscription.save();

 
    res.status(200).json({
        clientSecret: session.client_secret,
        url: session.url,
       
    });

};


const verifySubscription = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    console.log("sessionId", sessionId);

    const subscription = await SubscriptionPlan.findOne({ sessionId });

    if (!subscription) {
        res.status(404).json({ success: false, message: "Payment not found" });
        return;
    }
    let accountInfo = null;

    if (subscription.type === "UserSubscription" && subscription.userId) {
        accountInfo = await User.findById(subscription.userId);
    } else if (subscription.type === "CompanySubscription" && subscription.companyId) {
        accountInfo = await Company.findById(subscription.companyId);
    }

    if (!accountInfo) {
        res.status(404).json({ success: false, message: "User or Company not found" });
        return;
    }

    if (subscription.paymentStatus === "completed") {
        res.status(400).json({ success: false, message: "Payment has already been processed" });
        return;
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

   
    const payload = {
        userId: accountInfo._id,
        email: accountInfo.email,
    };

    const secretKey = process.env.USER_SECRETKEY!;
    const subscriptionToken = jwt.sign(payload, secretKey, { expiresIn: `${durationDays}d` });

    if (!subscriptionToken) {
        res.status(400).json({ success: false, message: "Error creating subscription token" });
        return;
    }

    res.cookie('subscriptionToken', subscriptionToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: durationDays * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({ success: true, subscription, accountInfo });
};



export {createSubscription,verifySubscription} 