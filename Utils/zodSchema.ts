import {z} from "zod"
import mongoose from "mongoose";
const ObjectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });
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



const UserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  dateOfBirth: z.string(), // Can be changed to `z.date()` if you want strict date validation
  location: z.string().optional(),
  profileImage: z.string().optional(),
  banner: z.string().optional(),

  skills: z.array(z.string()).optional(),
  jobTitle: z.array(z.string()).optional(),
  jobLocation: z.array(z.string()).optional(),

  education: z.array(
    z.object({
      qualification: z.string().min(1),
      startYear: z.string().min(4, "Invalid year"),
      endYear: z.string().min(4, "Invalid year"),
      college: z.string().min(1),
    })
  ).optional(),

  projects: z.array(
    z.object({
      title: z.string().min(1, "Project title is required"),
      description: z.string().min(1, "Project description is required"),
      link: z.string().url().optional(),
    })
  ).optional(),

  followers: z.array(ObjectIdSchema).optional(),
  following: z.array(ObjectIdSchema).optional(),

  about: z.string().optional(),

  resume: z.array(
    z.object({
      fileUrl: z.string().min(1, "Resume file URL is required"),
      type: z.enum(["PDF", "Video"]),
      uploadedAt: z.date().optional().default(new Date()),
    })
  ).optional(),

  coverLetter: z.string().optional(),

  isBlocked: z.boolean().default(false),
  role: z.enum(["user", "premium"]).default("user"),

  createdAt: z.date().optional().default(new Date()),
});

export type UserType = z.infer<typeof UserSchema>;


export { PostSchema,UserSchema };