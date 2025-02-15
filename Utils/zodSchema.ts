import { z } from "zod";
import mongoose from "mongoose";

const ObjectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

// validating an ID in req.params
export const IdSchema = z.object({
  id: ObjectIdSchema,
});

export type IdType = z.infer<typeof IdSchema>;

//login
  export const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });
  
  export type LoginType = z.infer<typeof LoginSchema>;

  
// User Schema Components
const educationSchema = z.object({
  qualification: z.string().optional(),
  startYear: z.string(),
  endYear: z.string(),
  subject: z.string().optional(),
  college: z.string(),
});
const locationSchema=z.object({
  country:z.string(),
      countryName:z.string(),
      state: z.string(),
      stateName: z.string(),
      city: z.string()
})
const joblocationSchema=z.object({
  country:z.string(),
      countryName:z.string(),
      state: z.string(),
      stateName: z.string(),
      city: z.string()
})

const experienceSchema = z.object({
  jobRole: z.string(),
  companyName: z.string(),
  startYear: z.string(),
  endYear: z.string(),
});

const resumeSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string(),
  uploadedAt: z.date().nullable().optional(),
  isDeleted: z.boolean().default(false),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string().url().optional(),
});

 export const connectingSchema = z.object({

  connectionID: ObjectIdSchema.optional(),
  status: z.boolean().default(false),
  createdAt: z.date().optional(),
});
export type ConnectionType = z.infer<typeof connectingSchema>;


const resumeFileSchema = z.object({
  fileUrl: z.string().url(),
  type: z.enum(["PDF", "Video"]),
  uploadedAt: z.date().nullable().optional(),
});

// User Schema
export const UserSchema = z.object({
  _id: ObjectIdSchema.optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  location: locationSchema,
  gender: z.string().optional(),
  profileImage: z.string().url().optional(),
  banner: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  jobTitle: z.array(z.string()),
  jobLocation: z.array(joblocationSchema),
  reports: z.array(ObjectIdSchema).optional(), 
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  resumePDF: z.array(resumeSchema).optional(),
  resumeVideo: z.array(resumeSchema).optional(),
  projects: z.array(projectSchema).optional(),
  connecting: z.array(connectingSchema).optional(),
  about: z.string().optional(),
  resume: z.array(resumeFileSchema).optional(),
  role: z.enum(["user", "premium"]).optional(),
  subscriptionEndDate: z.date().nullable().optional(),
  subscriptionStartDate: z.date().nullable().optional(),
  coverLetter: z.string().optional(),
  isBlocked: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type UserType = z.infer<typeof UserSchema>;

// Post Schema
const PostSchema = z.object({
  description: z.string().max(500).optional(),
  owner: ObjectIdSchema,
  images: z.string().optional(),
  lists: z.array(ObjectIdSchema),
  likedBy: z.array(ObjectIdSchema),
  reports: z.array(
    z.object({
      reportedBy: ObjectIdSchema,
      reason: z.string().min(1),
      reportedAt: z.date().optional().default(new Date()),
    })
  ),
  comments: z.array(
    z.object({
      user: ObjectIdSchema,
      comment: z.string().min(1),
      commentedAt: z.date().optional().default(new Date()),
      replies: z.array(
        z.object({
          user: ObjectIdSchema,
          reply: z.string().min(1),
          repliedAt: z.date().optional().default(new Date()),
        })
      ),
    })
  ),
});
export type PostType = z.infer<typeof PostSchema>;

//report
export const ReportSchema = z.object({
  reportedBy: z.string().min(24, "Invalid user ID").max(24, "Invalid user ID"), // MongoDB ObjectId (24 characters)
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500, "Reason must be at most 500 characters"),
  reportedAt: z.date().optional(), // Automatically set in Mongoose schema
  isDeleted: z.boolean().optional().default(false),
  status: z.enum(["pending", "reviewed", "resolved"]).optional().default("pending"),
});

export type ReportType = z.infer<typeof ReportSchema>;

//comment 
export const CommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Post ID").optional(),
  comment: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});
export type CommentType = z.infer<typeof CommentSchema>;

//reply
export const ReplySchema = z.object({
  postId: z.string().min(1, "Post ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Post ID"),
  commentId: z.string().min(1, "Comment ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Comment ID"),
  replyText: z.string().min(1, "Reply cannot be empty").max(500, "Reply is too long"),
});
export type ReplyType = z.infer<typeof ReplySchema>;

//rating
export const RatingSchema = z.object({
  review: z.string().min(3, "Review must be at least 3 characters long."),
  starsRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
})

export type RatingType = z.infer<typeof RatingSchema>;


 export const SubscriptionSchema = z.object({
  userId:ObjectIdSchema,
  companyId: ObjectIdSchema.optional(),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  features: z.array(z.string()).min(1, { message: "At least one feature is required" }),
  popular: z.boolean().default(false),
  sessionId: z.string().min(1, { message: "Session ID is required" }).optional(),
  plan: z.enum(["free", "one year", "six month","one month"]).default("free"),
  active: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.enum(["UserSubscription", "CompanySubscription"]),
  paymentStatus: z.enum(["pending", "completed"]).default("pending"),
});

export type SubscriptionType = z.infer<typeof SubscriptionSchema>;

export const VerificationSchema = z.object({
  sessionId: z.string().min(1, { message: "Session ID is required" })
});


export type VerificationType = z.infer<typeof VerificationSchema>;

//company
export const CompanySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  cpassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
  contact: z.string().min(10, "Contact number must be at least 10 digits"),
  age: z.string().optional(),
  IndustryType: z.string().optional(),
  about: z.string().min(10, "About must be at least 10 characters long"),
  role: z.string().default("company"),
  address: z.object({
    country: z.string().min(2, "Country is required"),
    state: z.string().min(2, "State is required"),
    city: z.string().min(2, "City is required"),
    pincode: z.string().min(4, "Pincode is required"),
  }),
  logo: z.string().optional(), // Assuming it's a file URL or path
});
export type CompanyType = z.infer<typeof CompanySchema>;

