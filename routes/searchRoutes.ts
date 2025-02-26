import express from "express";
import { jobSearch, UserSearch } from "../Controller/Search";
import { errorCatch } from "../middleware/tryCatch";
const searchRouter = express.Router();
searchRouter.get(`/usersearch`, errorCatch(UserSearch));
searchRouter.get(`/jobsearch`, errorCatch(jobSearch));

export { searchRouter };
