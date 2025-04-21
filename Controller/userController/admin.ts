import { Company } from "../../model/CompanySchema";
import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";
import { SubscriptionPlan } from "../../model/SubscriptionSchema";
import { Skill } from "../../model/SkillSchema";
import { Title } from "../../model/JobTitleSchema";

//user block and unblock
export const blockAndUnblock = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.id;
  if (!userId) {
    throw new CustomError("User ID for blocking is missing", 404);
  }

  const findUser = await User.findOne({ _id: userId });

  if (!findUser) {
    throw new CustomError("User to be blocked not found", 404);
  }

  findUser.isBlocked = !findUser.isBlocked;
  await findUser.save();

  res.status(200).json({
    status: true,
    message: `User ${
      findUser.isBlocked ? "blocked" : "unblocked"
    } successfully`,
    data: findUser,
  });
};

// get all Users
export const allUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find();
  const totalUsers = await User.countDocuments();
  const activeUsers = users.filter((user) => user.isBlocked === false);
  const activeUsersCount = activeUsers.length;
  const premiumUsers = users.filter((user) => user.role === "premium");
  const premiumUsersCount = premiumUsers.length;
  if (!users) {
    throw new CustomError("users not found", 404);
  }
  res.status(200).json({
    status: "success",
    massage: "Got all the users and the count",
    users,
    totalUsers,
    activeUsersCount,
    premiumUsersCount,
  });
};

//count of Daily Users

export const getDailyUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const currentDate = new Date();

  const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

  const TodayUsers = await User.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const users = await User.aggregate([
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
};

//today's companies
export const getDailyCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  const currentDate = new Date();

  const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

  const Todaycompanies = await Company.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });
  const companies = await Company.aggregate([
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
};

//daily revenue

export const getDailyRevenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const currentDate = new Date();

  const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
  const revenue = await SubscriptionPlan.aggregate([
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
};

//total revenue
export const getTotalRevenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const revenue = await SubscriptionPlan.aggregate([
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
};
//get company Total revenue
export const getTotalCompanyRevenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyRevenue = await SubscriptionPlan.aggregate([
    { $match: { type: "CompanySubscription", paymentStatus: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
  ]);

  res
    .status(200)
    .json({
      status: true,
      message: "Total Company Revenue",
      TotalcompanyRevenue:
        companyRevenue.length > 0 ? companyRevenue[0].totalRevenue : 0,
    });
};
//get user Total revenue
export const getTotalUserRevenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userRevenue = await SubscriptionPlan.aggregate([
    { $match: { type: "UserSubscription", paymentStatus: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
  ]);

  res
    .status(200)
    .json({
      status: true,
      message: "users revenue",
      TotaluserRevenue:
        userRevenue.length > 0 ? userRevenue[0].totalRevenue : 0,
    });
};

//skill creation

export const createSkills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = req.user?.id;
  const { name } = req.body;

  if (!adminId) {
    throw new CustomError("Admin not found", 404);
  }

  if (!name) {
    throw new CustomError("Skill name is required", 400);
  }

  // Check if skill already exists
  const existingSkill = await Skill.findOne({ name });
  if (existingSkill) {
    throw new CustomError("Skill already exists", 400);
  }

  const skill = new Skill({ name });
  await skill.save();

  res.status(201).json({ status: true, message: "Skill added", skill });
};

//all skills

export const AllSkills = async (req: Request, res: Response): Promise<void> => {
  const skills = await Skill.find({ isDeleted: false });
  res.status(200).json({ status: true, message: "all skills", skills });
};

//remove skill
export const RemoveSkills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const skillid = req.params.id;
  const skill = await Skill.findById({ _id: skillid });
  if (!skill) {
    throw new CustomError("skill not found", 404);
  }
  skill.isDeleted = true;
  await skill.save();
  res.status(200).json({ status: true, message: "skill removed" });
};

//edit skill

export const EditSkill = async (req: Request, res: Response): Promise<void> => {
  const skillId = req.params.id;
  console.log("skillId", skillId);

  const { newskill } = req.body;
  const skill = await Skill.findById({ _id: skillId });
  console.log("skill", skill);

  if (!skill) {
    throw new CustomError("skill not found", 404);
  }
  skill.name = newskill;
  await skill.save();
  res.status(200).json({ status: true, message: "skill updated", skill });
};

//approve skill
export const ApproveSkill = async (req: Request, res: Response) => {
  const skillID = req.params.id;
  const skill = await Skill.findById({ _id: skillID, status: false });
  if (!skill) {
    throw new CustomError("skill not found", 404);
  }
  skill.status = true;
  await skill.save();
  res.status(200).json({ status: true, message: "approved", skill });
};
//title creation

export const createTitles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = req.user?.id;
  const { name } = req.body;

  if (!adminId) {
    throw new CustomError("Admin not found", 404);
  }

  if (!name) {
    throw new CustomError("title name is required", 400);
  }

  const existingTitle = await Title.findOne({ name });
  if (existingTitle) {
    throw new CustomError("title already exists", 400);
  }

  const title = new Title({ name });
  await title.save();

  res.status(201).json({ status: true, message: "title added", title });
};

export const createTitlesbyUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  if (!name) {
    throw new CustomError("title name is required", 400);
  }

  const existingTitle = await Title.findOne({ name });
  if (existingTitle) {
    throw new CustomError("title already exists", 400);
  }

  const title = new Title({ name: name, status: false });
  await title.save();

  res.status(201).json({ status: true, message: "title added", title });
};

//all titles

export const AllTitles = async (req: Request, res: Response): Promise<void> => {
  const titles = await Title.find({ isDeleted: false, status: true });

  res.status(200).json({ status: true, message: "all titles ", titles });
};

//remove title
export const RemoveTitle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const titleId = req.params.titleid;
  console.log("titleId", titleId);

  const title = await Title.findById({ _id: titleId });
  if (!title) {
    throw new CustomError("title not found", 404);
  }
  title.isDeleted = true;
  await title.save();
  res.status(200).json({ status: true, message: "title removed" });
};

//edit title

export const EditTitle = async (req: Request, res: Response): Promise<void> => {
  const titleId = req.params.id;
  console.log("title", titleId);

  const { newTitle } = req.body;
  const title = await Title.findById({ _id: titleId });
  console.log("title", title);

  if (!title) {
    throw new CustomError("title not found", 404);
  }
  title.name = newTitle;
  await title.save();
  res.status(200).json({ status: true, message: "title updated", title });
};

//approve title
export const ApproveTitle = async (req: Request, res: Response) => {
  const titleID = req.params.id;
  const title = await Title.findById({ _id: titleID, status: false });
  if (!title) {
    throw new CustomError("Title not found", 404);
  }
  title.status = true;
  await title.save();
  res.status(200).json({ status: true, message: "approved", title });
};

export const allCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companies = await Company.find();
  const totalcompanies = await Company.countDocuments();

  const activeCompanies = companies.filter(
    (company) => company.isBlocked === false
  );
  const activeCompaniesCount = activeCompanies.length;
  const premiumCompanies = companies.filter(
    (company) => company.role === "premium"
  );
  const premiumCompaniesCount = premiumCompanies.length;
  if (!companies) {
    throw new CustomError("users not found", 404);
  }
  res.status(200).json({
    status: "success",
    massage: "Got all the users and the count",
    companies,
    totalcompanies,
    activeCompaniesCount,
    premiumCompaniesCount,
  });
};

export const getDailyuser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const revenueData = await SubscriptionPlan.aggregate([
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
    day: dayMap[entry._id as keyof typeof dayMap],
    revenue: entry.dailyRevenue,
  }));

  res.status(200).json({
    status: "success",
    dailyRevenue,
  });
};

export const getDailycompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const revenueData = await SubscriptionPlan.aggregate([
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
    day: dayMap[entry._id as keyof typeof dayMap],
    revenue: entry.dailyRevenue,
  }));

  res.status(200).json({
    status: "success",
    dailyRevenue,
  });
};

export const AllTitlesAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const titles = await Title.find({ isDeleted: false });
  res.status(200).json({ status: true, message: "all titles ", titles });
};

export const BlockCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  const companyId = req.params.id;
  if (!companyId) {
    throw new CustomError("company ID for blocking is missing", 404);
  }

  const findCompany = await Company.findOne({ _id: companyId });

  if (!findCompany) {
    throw new CustomError("company to be blocked not found", 404);
  }

  findCompany.isBlocked = !findCompany.isBlocked;
  await findCompany.save();

  res.status(200).json({
    status: true,
    message: `Company ${
      findCompany.isBlocked ? "blocked" : "unblocked"
    } successfully`,
    data: findCompany,
  });
};

export const getLast7DaysRevenue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);

    const revenueData = await SubscriptionPlan.aggregate([
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
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

function getMonthName(monthNumber: number): string {
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
