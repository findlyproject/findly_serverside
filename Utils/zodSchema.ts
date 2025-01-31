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

export { PostSchema };