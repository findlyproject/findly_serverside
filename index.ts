import express from "express";
import dotenv from "dotenv";
import { connectMongodb } from "./config/dbconections";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { router } from "./Routes/user/registration";
import { rating } from "./Routes/Rating/rating";
import postRouter from "./Routes/PostRoute/post";
import{Searchrouter} from'./Routes/SearchRoute/search';
dotenv.config();
const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
  }));
  app.use("/api/user",router)
  app.use("/api/rating",rating)



connectMongodb()

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

