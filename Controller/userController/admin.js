"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLast7DaysRevenue = exports.BlockCompany = exports.AllTitlesAdmin = exports.getDailycompany = exports.getDailyuser = exports.allCompanies = exports.ApproveTitle = exports.EditTitle = exports.RemoveTitle = exports.AllTitles = exports.createTitlesbyUser = exports.createTitles = exports.ApproveSkill = exports.EditSkill = exports.RemoveSkills = exports.AllSkills = exports.createSkills = exports.getTotalUserRevenue = exports.getTotalCompanyRevenue = exports.getTotalRevenue = exports.getDailyRevenue = exports.getDailyCompanies = exports.getDailyUsers = exports.allUsers = exports.blockAndUnblock = void 0;
const CompanySchema_1 = require("./../../model/CompanySchema");
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
const SubscriptionSchema_1 = require("../../model/SubscriptionSchema");
const SkillSchema_1 = require("../../model/SkillSchema");
const JobTitleSchema_1 = require("../../model/JobTitleSchema");
//user block and unblock
const blockAndUnblock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("User ID for blocking is missing", 404);
    }
    const findUser = yield UserSchema_1.default.findOne({ _id: userId });
    if (!findUser) {
        throw new errorHandler_1.CustomError("User to be blocked not found", 404);
    }
    findUser.isBlocked = !findUser.isBlocked;
    yield findUser.save();
    res.status(200).json({
        status: true,
        message: `User ${findUser.isBlocked ? "blocked" : "unblocked"} successfully`,
        data: findUser,
    });
});
exports.blockAndUnblock = blockAndUnblock;
// get all Users
const allUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield UserSchema_1.default.find();
    const totalUsers = yield UserSchema_1.default.countDocuments();
    const activeUsers = users.filter((user) => user.isBlocked === false);
    const activeUsersCount = activeUsers.length;
    const premiumUsers = users.filter((user) => user.role === "premium");
    const premiumUsersCount = premiumUsers.length;
    if (!users) {
        throw new errorHandler_1.CustomError("users not found", 404);
    }
    res.status(200).json({
        status: "success",
        massage: "Got all the users and the count",
        users,
        totalUsers,
        activeUsersCount,
        premiumUsersCount,
    });
});
exports.allUsers = allUsers;
//count of Daily Users
const getDailyUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    const TodayUsers = yield UserSchema_1.default.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    const users = yield UserSchema_1.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
            },
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
            },
        },
    ]);
    res.json({
        dailyUserCount: users.length > 0 ? users[0].count : 0,
        TodayUsers,
    });
});
exports.getDailyUsers = getDailyUsers;
//today's companies
const getDailyCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    const Todaycompanies = yield CompanySchema_1.Company.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    const companies = yield CompanySchema_1.Company.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
            },
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
            },
        },
    ]);
    res.json({
        dailyCompanyCount: companies.length > 0 ? companies[0].count : 0,
        Todaycompanies,
    });
});
exports.getDailyCompanies = getDailyCompanies;
//daily revenue
const getDailyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    const revenue = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
                paymentStatus: "completed",
            },
        },
        {
            $group: {
                _id: null,
                dailyRevenue: { $sum: "$price" },
            },
        },
    ]);
    res.json({ dailyRevenue: revenue.length > 0 ? revenue[0].dailyRevenue : 0 });
});
exports.getDailyRevenue = getDailyRevenue;
//total revenue
const getTotalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const revenue = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        {
            $match: { paymentStatus: "completed" },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$price" },
            },
        },
    ]);
    res
        .status(200)
        .json({
        status: true,
        message: "total revenue",
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
    });
});
exports.getTotalRevenue = getTotalRevenue;
//get company Total revenue
const getTotalCompanyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyRevenue = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        { $match: { type: "CompanySubscription", paymentStatus: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);
    res
        .status(200)
        .json({
        status: true,
        message: "Total Company Revenue",
        TotalcompanyRevenue: companyRevenue.length > 0 ? companyRevenue[0].totalRevenue : 0,
    });
});
exports.getTotalCompanyRevenue = getTotalCompanyRevenue;
//get user Total revenue
const getTotalUserRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRevenue = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        { $match: { type: "UserSubscription", paymentStatus: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);
    res
        .status(200)
        .json({
        status: true,
        message: "users revenue",
        TotaluserRevenue: userRevenue.length > 0 ? userRevenue[0].totalRevenue : 0,
    });
});
exports.getTotalUserRevenue = getTotalUserRevenue;
//skill creation
const createSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name } = req.body;
    if (!adminId) {
        throw new errorHandler_1.CustomError("Admin not found", 404);
    }
    if (!name) {
        throw new errorHandler_1.CustomError("Skill name is required", 400);
    }
    // Check if skill already exists
    const existingSkill = yield SkillSchema_1.Skill.findOne({ name });
    if (existingSkill) {
        throw new errorHandler_1.CustomError("Skill already exists", 400);
    }
    const skill = new SkillSchema_1.Skill({ name });
    yield skill.save();
    res.status(201).json({ status: true, message: "Skill added", skill });
});
exports.createSkills = createSkills;
//all skills
const AllSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skills = yield SkillSchema_1.Skill.find({ isDeleted: false });
    res.status(200).json({ status: true, message: "all skills", skills });
});
exports.AllSkills = AllSkills;
//remove skill
const RemoveSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skillid = req.params.id;
    const skill = yield SkillSchema_1.Skill.findById({ _id: skillid });
    if (!skill) {
        throw new errorHandler_1.CustomError("skill not found", 404);
    }
    skill.isDeleted = true;
    yield skill.save();
    res.status(200).json({ status: true, message: "skill removed" });
});
exports.RemoveSkills = RemoveSkills;
//edit skill
const EditSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skillId = req.params.id;
    console.log("skillId", skillId);
    const { newskill } = req.body;
    const skill = yield SkillSchema_1.Skill.findById({ _id: skillId });
    console.log("skill", skill);
    if (!skill) {
        throw new errorHandler_1.CustomError("skill not found", 404);
    }
    skill.name = newskill;
    yield skill.save();
    res.status(200).json({ status: true, message: "skill updated", skill });
});
exports.EditSkill = EditSkill;
//approve skill
const ApproveSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skillID = req.params.id;
    const skill = yield SkillSchema_1.Skill.findById({ _id: skillID, status: false });
    if (!skill) {
        throw new errorHandler_1.CustomError("skill not found", 404);
    }
    skill.status = true;
    yield skill.save();
    res.status(200).json({ status: true, message: "approved", skill });
});
exports.ApproveSkill = ApproveSkill;
//title creation
const createTitles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name } = req.body;
    if (!adminId) {
        throw new errorHandler_1.CustomError("Admin not found", 404);
    }
    if (!name) {
        throw new errorHandler_1.CustomError("title name is required", 400);
    }
    const existingTitle = yield JobTitleSchema_1.Title.findOne({ name });
    if (existingTitle) {
        throw new errorHandler_1.CustomError("title already exists", 400);
    }
    const title = new JobTitleSchema_1.Title({ name });
    yield title.save();
    res.status(201).json({ status: true, message: "title added", title });
});
exports.createTitles = createTitles;
const createTitlesbyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        throw new errorHandler_1.CustomError("title name is required", 400);
    }
    const existingTitle = yield JobTitleSchema_1.Title.findOne({ name });
    if (existingTitle) {
        throw new errorHandler_1.CustomError("title already exists", 400);
    }
    const title = new JobTitleSchema_1.Title({ name: name, status: false });
    yield title.save();
    res.status(201).json({ status: true, message: "title added", title });
});
exports.createTitlesbyUser = createTitlesbyUser;
//all titles
const AllTitles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const titles = yield JobTitleSchema_1.Title.find({ isDeleted: false, status: true });
    res.status(200).json({ status: true, message: "all titles ", titles });
});
exports.AllTitles = AllTitles;
//remove title
const RemoveTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const titleId = req.params.titleid;
    console.log("titleId", titleId);
    const title = yield JobTitleSchema_1.Title.findById({ _id: titleId });
    if (!title) {
        throw new errorHandler_1.CustomError("title not found", 404);
    }
    title.isDeleted = true;
    yield title.save();
    res.status(200).json({ status: true, message: "title removed" });
});
exports.RemoveTitle = RemoveTitle;
//edit title
const EditTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const titleId = req.params.id;
    console.log("title", titleId);
    const { newTitle } = req.body;
    const title = yield JobTitleSchema_1.Title.findById({ _id: titleId });
    console.log("title", title);
    if (!title) {
        throw new errorHandler_1.CustomError("title not found", 404);
    }
    title.name = newTitle;
    yield title.save();
    res.status(200).json({ status: true, message: "title updated", title });
});
exports.EditTitle = EditTitle;
//approve title
const ApproveTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const titleID = req.params.id;
    const title = yield JobTitleSchema_1.Title.findById({ _id: titleID, status: false });
    if (!title) {
        throw new errorHandler_1.CustomError("Title not found", 404);
    }
    title.status = true;
    yield title.save();
    res.status(200).json({ status: true, message: "approved", title });
});
exports.ApproveTitle = ApproveTitle;
const allCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companies = yield CompanySchema_1.Company.find();
    const totalcompanies = yield CompanySchema_1.Company.countDocuments();
    const activeCompanies = companies.filter((company) => company.isBlocked === false);
    const activeCompaniesCount = activeCompanies.length;
    const premiumCompanies = companies.filter((company) => company.role === "premium");
    const premiumCompaniesCount = premiumCompanies.length;
    if (!companies) {
        throw new errorHandler_1.CustomError("users not found", 404);
    }
    res.status(200).json({
        status: "success",
        massage: "Got all the users and the count",
        companies,
        totalcompanies,
        activeCompaniesCount,
        premiumCompaniesCount,
    });
});
exports.allCompanies = allCompanies;
const getDailyuser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const revenueData = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        { $match: { type: "UserSubscription", paymentStatus: "completed" } },
        {
            $project: {
                price: 1,
                dayOfWeek: { $dayOfWeek: "$createdAt" },
            },
        },
        {
            $group: {
                _id: "$dayOfWeek",
                dailyRevenue: { $sum: "$price" },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const dayMap = {
        1: "Sunday",
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday",
    };
    const dailyRevenue = revenueData.map((entry) => ({
        day: dayMap[entry._id],
        revenue: entry.dailyRevenue,
    }));
    res.status(200).json({
        status: "success",
        dailyRevenue,
    });
});
exports.getDailyuser = getDailyuser;
const getDailycompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const revenueData = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        { $match: { type: "CompanySubscription", paymentStatus: "completed" } },
        {
            $project: {
                price: 1,
                dayOfWeek: { $dayOfWeek: "$createdAt" },
            },
        },
        {
            $group: {
                _id: "$dayOfWeek",
                dailyRevenue: { $sum: "$price" },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const dayMap = {
        1: "Sunday",
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday",
    };
    const dailyRevenue = revenueData.map((entry) => ({
        day: dayMap[entry._id],
        revenue: entry.dailyRevenue,
    }));
    res.status(200).json({
        status: "success",
        dailyRevenue,
    });
});
exports.getDailycompany = getDailycompany;
const AllTitlesAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const titles = yield JobTitleSchema_1.Title.find({ isDeleted: false });
    res.status(200).json({ status: true, message: "all titles ", titles });
});
exports.AllTitlesAdmin = AllTitlesAdmin;
const BlockCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    if (!companyId) {
        throw new errorHandler_1.CustomError("company ID for blocking is missing", 404);
    }
    const findCompany = yield CompanySchema_1.Company.findOne({ _id: companyId });
    if (!findCompany) {
        throw new errorHandler_1.CustomError("company to be blocked not found", 404);
    }
    findCompany.isBlocked = !findCompany.isBlocked;
    yield findCompany.save();
    res.status(200).json({
        status: true,
        message: `Company ${findCompany.isBlocked ? "blocked" : "unblocked"} successfully`,
        data: findCompany,
    });
});
exports.BlockCompany = BlockCompany;
const getLast7DaysRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 6);
        const revenueData = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
            {
                $match: {
                    paymentStatus: "completed",
                    createdAt: { $gte: last7Days, $lte: today },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    totalRevenue: { $sum: "$price" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                },
            },
        ]);
        const formattedData = revenueData.map((item) => ({
            day: `${item._id.day} ${getMonthName(item._id.month)}`,
            revenue: item.totalRevenue,
        }));
        const finalData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() - (6 - i));
            const day = date.getDate();
            const month = getMonthName(date.getMonth() + 1);
            const existing = formattedData.find((d) => d.day === `${day} ${month}`);
            finalData.push({
                day: `${day} ${month}`,
                revenue: existing ? existing.revenue : 0,
            });
        }
        res.status(200).json({
            status: "success",
            message: "Fetched revenue data for the last 7 days",
            data: finalData,
        });
    }
    catch (error) {
        console.error("Error fetching revenue data:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
exports.getLast7DaysRevenue = getLast7DaysRevenue;
function getMonthName(monthNumber) {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return months[monthNumber - 1];
}
