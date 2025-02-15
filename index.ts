import express from "express";
import dotenv from "dotenv";
import { connectMongodb } from "./config/dbconections";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/userRoutes";
import { ratingRouter } from "./routes/ratingRoutes";
import { paymentRouter } from "./routes/PaymentRoutes";
import{searchRouter} from'./routes/searchRoutes';
import { adminRouter } from "./routes/AdminRoutes";
import errorHandler from "./middleware/customClassMiddleware";
import postRouter from "./routes/postRoutes";
import { connectionRouter } from "./routes/connectionRoutes";

dotenv.config();
const app = express();


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',   
    credentials: true,
  }));
  app.use("/api/user",userRouter)
  app.use("/api/rating",ratingRouter) 
  app.use("/api/post",postRouter)
  app.use("/api/payment",paymentRouter)
  app.use("/api/user",searchRouter)
  app.use("/api/connecting",connectionRouter)
  app.use("/api/admin",adminRouter)

  app.use(errorHandler);

connectMongodb()

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

