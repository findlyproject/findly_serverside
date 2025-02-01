
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
    images?: string;
    lists: Types.ObjectId[];
    likedBy: Types.ObjectId[];
    reports: IReport[]; 
    comments: IComment[];
  }
  