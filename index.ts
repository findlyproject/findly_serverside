import express from "express";
import dotenv from "dotenv";
import { connectMongodb } from "./src/config/dbconections";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { userRouter } from "./src/routes/userRoutes";
import { ratingRouter } from "./src/routes/ratingRoutes";
import { paymentRouter } from "./src/routes/PaymentRoutes";
import{searchRouter} from'./src/routes/searchRoutes';
import { adminRouter } from "./src/routes/AdminRoutes";
import errorHandler from "./src/middleware/customClassMiddleware";
import postRouter from "./src/routes/postRoutes";
import { connectionRouter } from "./src/routes/connectionRoutes";
import { companyRouter } from "./src/routes/compnayRoutes";
import { app, server } from "./socket";
import { messageRoute } from "./src/routes/messageRoute";


 

dotenv.config();


// app.use(express.json({ limit: "50mb" })); 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',   
    credentials: true, 
  }));

  app.use("/api/user",userRouter)
  app.use("/api/rating",ratingRouter) 
  app.use("/api/post",postRouter)
  app.use("/api/payment",paymentRouter)
  app.use("/api/search",searchRouter)
  app.use("/api/connecting",connectionRouter)
  app.use("/api/admin",adminRouter)
  app.use("/api/company",companyRouter)
app.use("/api/message",messageRoute)
  app.use(errorHandler);
  app.use((req, res, next) => {
    console.log(`Incoming: ${req.method} ${req.originalUrl}`);
    next();
  });

  (async () => {
    console.time('Startup1');
    console.log('Connecting to DB...');
    await connectMongodb();
    console.timeEnd('Startup1');
  
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })();
  
// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });