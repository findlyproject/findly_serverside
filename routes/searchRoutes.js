"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = __importDefault(require("express"));
const Search_1 = require("../Controller/Search");
const tryCatch_1 = require("../middleware/tryCatch");
const searchRouter = express_1.default.Router();
exports.searchRouter = searchRouter;
searchRouter.get(`/usersearch`, (0, tryCatch_1.errorCatch)(Search_1.UserSearch));
searchRouter.get(`/jobsearch`, (0, tryCatch_1.errorCatch)(Search_1.jobSearch));
