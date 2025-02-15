import express from "express";
import { UserSearch } from "../Controller/Search";
import { errorCatch } from "../middleware/tryCatch";
const searchRouter = express.Router();
searchRouter.get(`/usersearch`, errorCatch(UserSearch));

export { searchRouter };
