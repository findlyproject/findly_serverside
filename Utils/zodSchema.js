"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobPostSchema = exports.CompanySchema = exports.VerificationSchema = exports.SubscriptionSchema = exports.RatingSchema = exports.ReplySchema = exports.CommentSchema = exports.ReportSchema = exports.UserSchema = exports.connectingSchema = exports.LoginSchema = exports.IdSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectIdSchema = zod_1.z
    .string()
    .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
});
// validating an ID in req.params
exports.IdSchema = zod_1.z.object({
    id: ObjectIdSchema,
});
//login
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters long" }),
});
// User Schema Compone nts
const educationSchema = zod_1.z.object({
    qualification: zod_1.z.string().optional(),
    startYear: zod_1.z.string(),
    endYear: zod_1.z.string(),
    subject: zod_1.z.string().optional(),
    college: zod_1.z.string(),
});
const locationSchema = zod_1.z.object({
    country: zod_1.z.string(),
    countryName: zod_1.z.string(),
    state: zod_1.z.string(),
    stateName: zod_1.z.string(),
    city: zod_1.z.string()
});
const joblocationSchema = zod_1.z.object({
    country: zod_1.z.string(),
    countryName: zod_1.z.string(),
    state: zod_1.z.string(),
    stateName: zod_1.z.string(),
    city: zod_1.z.string()
});
const experienceSchema = zod_1.z.object({
    jobRole: zod_1.z.string(),
    companyName: zod_1.z.string(),
    startYear: zod_1.z.string(),
    endYear: zod_1.z.string(),
});
const resumeSchema = zod_1.z.object({
    fileUrl: zod_1.z.string().url(),
    fileName: zod_1.z.string(),
    uploadedAt: zod_1.z.string().nullable().optional(),
    isDeleted: zod_1.z.boolean().default(false),
});
const projectSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    link: zod_1.z.string().url().optional(),
});
exports.connectingSchema = zod_1.z.object({
    connectionID: ObjectIdSchema.optional(),
    status: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().optional(),
});
const resumeFileSchema = zod_1.z.object({
    fileUrl: zod_1.z.string().url(),
    type: zod_1.z.enum(["PDF", "Video"]),
    uploadedAt: zod_1.z.date().nullable().optional(),
});
// User Schema
exports.UserSchema = zod_1.z.object({
    _id: ObjectIdSchema.optional(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    location: locationSchema,
    gender: zod_1.z.string(),
    profileImage: zod_1.z.string().url().optional(),
    banner: zod_1.z.string().url().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    jobTitle: zod_1.z.array(zod_1.z.string()),
    jobLocation: zod_1.z.array(joblocationSchema),
    reports: zod_1.z.array(ObjectIdSchema).optional(),
    education: zod_1.z.array(educationSchema).optional(),
    experience: zod_1.z.array(experienceSchema).optional(),
    resumePDF: zod_1.z.array(resumeSchema).optional(),
    resumeVideo: zod_1.z.array(resumeSchema).optional(),
    projects: zod_1.z.array(projectSchema).optional(),
    connecting: zod_1.z.array(exports.connectingSchema).optional(),
    about: zod_1.z.string().optional(),
    resume: zod_1.z.array(resumeFileSchema).optional(),
    role: zod_1.z.enum(["user", "premium"]).optional(),
    subscriptionEndDate: zod_1.z.date().nullable().optional(),
    subscriptionStartDate: zod_1.z.date().nullable().optional(),
    coverLetter: zod_1.z.string().optional(),
    isBlocked: zod_1.z.boolean().default(false),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().optional(),
    updatedAt: zod_1.z.string().optional(),
});
// Post Schema
const PostSchema = zod_1.z.object({
    description: zod_1.z.string().max(500).optional(),
    owner: ObjectIdSchema,
    images: zod_1.z.string().optional(),
    lists: zod_1.z.array(ObjectIdSchema),
    likedBy: zod_1.z.array(ObjectIdSchema),
    reports: zod_1.z.array(zod_1.z.object({
        reportedBy: ObjectIdSchema,
        reason: zod_1.z.string().min(1),
        reportedAt: zod_1.z.date().optional().default(new Date()),
    })),
    comments: zod_1.z.array(zod_1.z.object({
        user: ObjectIdSchema,
        comment: zod_1.z.string().min(1),
        commentedAt: zod_1.z.date().optional().default(new Date()),
        replies: zod_1.z.array(zod_1.z.object({
            user: ObjectIdSchema,
            reply: zod_1.z.string().min(1),
            repliedAt: zod_1.z.date().optional().default(new Date()),
        })),
    })),
});
//report
exports.ReportSchema = zod_1.z.object({
    reportedBy: zod_1.z.string().min(24, "Invalid user ID").max(24, "Invalid user ID").optional(), // MongoDB ObjectId (24 characters)
    reason: zod_1.z.string().min(5, "Reason must be at least 5 characters").max(500, "Reason must be at most 500 characters"),
    reportedAt: zod_1.z.date().optional(), // Automatically set in Mongoose schema
    isDeleted: zod_1.z.boolean().optional().default(false),
    status: zod_1.z.enum(["pending", "reviewed", "resolved"]).optional().default("pending"),
});
//comment 
exports.CommentSchema = zod_1.z.object({
    postId: zod_1.z.string().min(1, "Post ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Post ID").optional(),
    comment: zod_1.z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
});
//reply
exports.ReplySchema = zod_1.z.object({
    postId: zod_1.z.string().min(1, "Post ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Post ID"),
    commentId: zod_1.z.string().min(1, "Comment ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid Comment ID"),
    replyText: zod_1.z.string().min(1, "Reply cannot be empty").max(500, "Reply is too long"),
});
//rating
exports.RatingSchema = zod_1.z.object({
    review: zod_1.z.string().min(3, "Review must be at least 3 characters long."),
    starsRating: zod_1.z.number().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
});
exports.SubscriptionSchema = zod_1.z.object({
    price: zod_1.z.number().min(0, { message: "Price must be a positive number" }),
    features: zod_1.z.array(zod_1.z.string()).min(1, { message: "At least one feature is required" }),
    popular: zod_1.z.boolean().default(false),
    sessionId: zod_1.z.string().min(1, { message: "Session ID is required" }).optional(),
    plan: zod_1.z.enum(["free", "one year", "six month", "one month"]).default("free"),
    active: zod_1.z.boolean().default(false),
    startDate: zod_1.z.date().optional(),
    endDate: zod_1.z.date().optional(),
    type: zod_1.z.enum(["UserSubscription", "CompanySubscription"]).optional(),
    paymentStatus: zod_1.z.enum(["pending", "completed"]).default("pending"),
});
exports.VerificationSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, { message: "Session ID is required" })
});
//company
exports.CompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters long"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    cpassword: zod_1.z.string().min(6, "Confirm password must be at least 6 characters long"),
    contact: zod_1.z.string().min(10, "Contact number must be at least 10 digits"),
    age: zod_1.z.number().optional(),
    IndustryType: zod_1.z.string().optional(),
    about: zod_1.z.string().min(10, "About must be at least 10 characters long").optional(),
    founder: zod_1.z.string().min(4, "founder is required"),
    foundedAt: zod_1.z.string(),
    type: zod_1.z.string().default("company"),
    address: zod_1.z.object({
        landmark: zod_1.z.string().min(2, "landmark is required"),
        country: zod_1.z.string().min(2, "Country is required"),
        state: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        pincode: zod_1.z.string().optional(),
    }),
});
exports.jobPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, { message: "Title is required" }),
    company: zod_1.z.string().min(1, { message: "Company is required" }),
    location: zod_1.z.string().min(1, { message: "Location is required" }),
    jobType: zod_1.z.string().min(1, { message: "Job Type is required" }),
    experienceLevel: zod_1.z.string().min(1, { message: "Experience Level is required" }),
    industry: zod_1.z.string().min(1, { message: "Industry is required" }),
    description: zod_1.z.string().min(1, { message: "Description is required" }),
    salary: zod_1.z.object({
        rate: zod_1.z.string().min(1, { message: "Rate is required (e.g., Hourly, Monthly)" }),
        min: zod_1.z.number().min(0, { message: "Minimum salary must be 0 or more" }),
        max: zod_1.z.number().min(0, { message: "maximum salary must be 0 or more" })
    }),
    contactEmail: zod_1.z.string().email({ message: "Invalid email address" }).min(1, { message: "Contact Email is required" }),
});
