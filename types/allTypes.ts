
import mongoose, { Document, Schema, Types } from "mongoose";


export interface IReport extends Document {
    reportedBy: Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }

  export interface IReply extends Document {
    user: Types.ObjectId;
    reply: string;
    repliedAt: Date;
  }

  export interface IComment extends Document {
    user: Types.ObjectId;
    comment: string;
    commentedAt: Date;
    replies: Types.ObjectId[];  
  }


export interface IPost extends Document {
    description?: string;
    owner: Types.ObjectId;
    images?: string[];  
  video?: string; 
    lists: Types.ObjectId[];
    likedBy: Types.ObjectId[];
    reports: IReport[]; 
    comments: IComment[];
  }

  export interface IRating extends Document{
    review?:string,
    starsRating?:number,
    userId?:Types.ObjectId
    createdAt?:Date
  }

  export interface ISubscription extends Document{
     userId?:Types.ObjectId,
     companyId?:Types.ObjectId,
    price?:number,
    features?:string[],
    popular:boolean,
    plan?:string,
    active?:boolean,
    startDate?:Date,
    endDate?:Date,
    sessionId?:string,
    type: "UserSubscription" | "CompanySubscription"; 
    paymentStatus:"pending"|"completed"

  }
  export interface ICompany extends Document {
    name: string;
    logo: string;
    location: string;
    about: string;
    email: string;
    contact: number;
    employees: string; 
    role?:"user"|"premium"
}
  
