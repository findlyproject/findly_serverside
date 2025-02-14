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


