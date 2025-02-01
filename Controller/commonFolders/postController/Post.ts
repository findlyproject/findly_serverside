// import { Request, Response } from "express";
// import { Post } from "../../../Model/PostSchema";  // Import the Post model


// // Function to Add a New Post
// export const addPost = async (req: Request, res: Response) => {
    
 
//     const { description, owner } = req.body;

//     if (!owner) {
//       return res.status(400).json({ error: "Owner ID is required" });
//     }

//     let mediaUrls: string[] = [];

//     // Check if a file was uploaded
//     if (req.files) {
//       if (Array.isArray(req.files)) {
//         mediaUrls = req.files.map((file: Express.Multer.File) => file.path);
//       } else if (req.file) {
//         mediaUrls = [req.file.path];
//       }
//     }

//     // Create new post
//     const newPost = new Post({
//       description,
//       owner,
//       images: mediaUrls.length > 0 ? mediaUrls : undefined, 
//     });

//     await newPost.save();

//     return res.status(201).json({ message: "Post created successfully", post: newPost });

// };
