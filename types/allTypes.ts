
import mongoose, { Document, Schema, Types } from "mongoose";


export interface IReport extends Document {
    reportedBy: Types.ObjectId;
    reason: string;
    reportedAt: Date;
    isDeleted:boolean;
  }

  export interface IReply extends Document {
    user: Types.ObjectId;
    reply: string;
    repliedAt: Date;
    isDeleted:boolean;
  }

  export interface IComment extends Document {
    user: Types.ObjectId;
    comment: string;
    commentedAt: Date;
    replies: Types.ObjectId[];  
    isDeleted:boolean;
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
    isDeleted:boolean;
  }   

  export interface IRating extends Document{
    review?:string,
    starsRating?:number,
    userId?:Types.ObjectId
    createdAt?:Date
    isDeleted:boolean
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
    type: "UserSubscription" | "CompanySubscription",
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
    role?:"user"|"premium",
    subscriptionEndDate: Date | null,
      subscriptionStartDate: Date | null,
      isDeleted:boolean
}
  
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  location?: string;
  gender?:string;
  profileImage?: string;
  banner?: string;
  skills?: string[];
  jobTitle?: string[];
  jobLocation?: string[];
  reports: mongoose.Types.ObjectId[]; 

  education: {
    qualification: string;
    startYear: string;
    endYear: string;
    location: string;
  };

  projects?: {
    title: string;
    description: string;
    link?: string;
  }[];

  connecting: [{
    connectionID:mongoose.Types.ObjectId;
    status:boolean;
  }],


  about?: string;

  resume?: {
    fileUrl: string;
    type: "PDF" | "Video";
    uploadedAt?: Date;
  }[];
  role:"user"|"premium",
  subscriptionEndDate: Date | null,
  subscriptionStartDate: Date | null,

  coverLetter?: string;
  isBlocked?: boolean;
  isDeleted?:boolean;
  _id: string;
}



export interface IAdmin extends Document{
  email:string;
  password:string;
}


