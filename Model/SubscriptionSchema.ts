import mongoose, { Schema } from "mongoose";
import { ISubscription } from "../types/allTypes";

const SubscriptionPlanSchema = new Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },

    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    sessionId: { type: String, require: true },
    plan: { type: String, default: "free" },
    active: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    type: {
      type: String,
      required: true,
      enum: ["UserSubscription", "CompanySubscription"],
    },
    paymentStatus: {
      type: String,
      required: true,  
      default: "pending",
      enum: ["pending", "completed"],
    },
  },
  { discriminatorKey: "type", timestamps: true }
);

export const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  SubscriptionPlanSchema
);
