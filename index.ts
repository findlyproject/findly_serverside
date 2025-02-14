import express from "express";
import dotenv from "dotenv";
import { connectMongodb } from "./config/dbconections";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { router } from "./Routes/user/registration";
import { rating } from "./Routes/Rating/rating";
import postRouter from "./Routes/PostRoute/post";
import { paymentRouter } from "./Routes/PaymentRoute/PaymentRoutes";
import{Searchrouter} from'./Routes/SearchRoute/search';

import { connectionroute } from "./Routes/user/connection";
import { adminRoutes } from "./Routes/Admin/AdminRoutes";
import errorHandler from "./middleware/customClassMiddleware";

dotenv.config();
const app = express();


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',   
    credentials: true,
  }));
  app.use("/api/user",router)
  app.use("/api/rating",rating) 
  app.use("/api/post",postRouter)
  app.use("/api/payment",paymentRouter)
  app.use("/api/user",Searchrouter)
  app.use("/api/connecting",connectionroute)
  app.use("/api/admin",adminRoutes)

  app.use(errorHandler);

connectMongodb()

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

