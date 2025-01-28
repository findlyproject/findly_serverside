import mongoose from "mongoose";

const connectMongodb = ()=>{
    mongoose
  .connect(process.env.MONGODB_URL as string,{
    serverSelectionTimeoutMS: 3000,
  })
  .then(() => {
    
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

}
  export {connectMongodb}