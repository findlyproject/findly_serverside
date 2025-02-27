import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReport extends Document {
  reportedBy: Types.ObjectId;
  reason: string;
  reportedAt: Date;
  isDeleted: boolean;
}

export interface IReply extends Document {
  user: Types.ObjectId;
  reply: string;
  repliedAt: Date;
  isDeleted: boolean;
  updatedAt: Date;
}

export interface IComment extends Document {
  user: Types.ObjectId;
  comment: string;
  commentedAt: Date;
  replies: Types.ObjectId[];
  isDeleted: boolean;
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
  isDeleted: boolean;
}

export interface IRating extends Document {
  review?: string;
  starsRating?: number;
  userId?: Types.ObjectId;
  createdAt?: Date;
  isDeleted: boolean;
  status:boolean
}

export interface ISubscription extends Document {
  userId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  price?: number;
  features?: string[];
  popular: boolean;
  plan?: string;
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
  sessionId?: string;
  type: "UserSubscription" | "CompanySubscription";
  paymentStatus: "pending" | "completed";
}

export interface ICompany extends Document {
  name: string;
  logo: string;
  about?: string;
  email: string;
  contact: number;
  password: string;

  employees: {
    employee: string; 
    position: string; 
  }[];

  role?: "company" | "premium";
    type:string
  age?: number;
  IndustryType?: string;

  address: {
    pincode: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
  };

  subscriptionEndDate: Date | null;
  subscriptionStartDate: Date | null;
  isBlocked?: boolean;
  isDeleted: boolean;
}


export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  location?: {
    country: string;
    countryName: string;
    state: string;
    stateName: string;
    city: string;
  };
  gender?: string;
  profileImage?: string;
  banner?: string;
  skills?: string[];
  jobTitle?: string[];
  jobLocation?: {
    country: string;
    countryName: string;
    state: string;
    stateName: string;
    city: string;
  }[];
  reports: mongoose.Types.ObjectId[];

  education: {
    qualification: string;
    startYear: string;
    endYear: string;
    college: string;
    subject: string;
  }[];

  experience: {
    jobRole: string;
    companyName: string;
    startYear: string;
    endYear: string;
  }[];

  resumePDF?: {
    fileUrl: string;
    fileName: string;
    uploadedAt: Date | null;
    isDeleted: boolean;
  }[];

  resumeVideo?: {
    fileUrl?: string;
    fileName: string;
    uploadedAt?: Date | null;
    isDeleted?: boolean;
  }[];

  projects?: {
    title: string;
    description: string;
    link?: string;
  }[];

  connecting: {
    connectionID: mongoose.Types.ObjectId;
    status: boolean;
    createdAt: Date;
  }[];

  about?: string;

  resume?: {
    fileUrl: string;
    type: "PDF" | "Video";
    uploadedAt: Date | null;
  }[];
  role: "user" | "premium";
  type:string
  subscriptionEndDate: Date | null;
  subscriptionStartDate: Date | null;

  coverLetter?: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  _id: string;
}

export interface IAdmin extends Document {
  email: string;
  password: string;
  firstName:string;
  lastName:string;
  profileImage:String;
  bio:string;
  role: "user" | "admin";
  phoneNumber:string;
  isBlocked?: boolean;
  isDeleted?: boolean;
}



export interface ISkill extends Document{
  name:string;
  status:boolean;
  isDeleted:boolean
}


export interface ITitles extends Document{
  name:string;
  status:boolean;
  isDeleted:boolean
}



export interface IJobPost {
  title: string;
  company: Types.ObjectId;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  experienceLevel:"Entry" | "Mid" | "Senior" | "Expert";
  jobResponsibilities:string[]
  industry:string;
  applicationDeadline:Date|null
  contactEmail:string;
  contactPhone:string
  benefits:string[]
  description: string;
  requirements: string[];
  qualification:string
  salary:{
    rate:string,
    min:number,
    max:number
  }
  images: string[]; 
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  reports: Types.ObjectId[]; 
  status:"Open"|"Closed"
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}    


export interface IJobApplication extends Document {
  jobId: Types.ObjectId | { _id: Types.ObjectId; title: string };
  userId: Types.ObjectId | { _id: Types.ObjectId; email: string; firstName: string };
  companyId: Types.ObjectId | { _id: Types.ObjectId; name: string }; // Ensuring `_id` in populated data
  resumeName: string;
  resumeurl: string;
  coverLetter?: string;
  introVideoName?: string;
  introVideoUrl?: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt?: Date;
  updatedAt?: Date;
  offerLetter?:string;
}
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  type:string;
  seen:boolean;
  message: string;
  isDeleted:boolean;
  timestamp: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastUpdated: Date;
}

export interface ICommunity extends Document{
  name: string;
  profile:string;
  description: string;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  timestamp:Date;
}

export interface ICommunityMessage extends Document{
  communityId : mongoose.Types.ObjectId
  sender:mongoose.Types.ObjectId
  message:string;
  type:string;
  isDelete:boolean;
  timestamp:Date
}
