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
exports.getPrimeClients = exports.getTotalRevenue = exports.spacificuserdetails = exports.removeResumeFile = exports.getUploadedFiles = exports.uploadResume = exports.verifyingOTP = exports.sendingOTP = exports.updateOtherDetails = exports.updateBasicInfo = exports.updateProfileImage = exports.updateBanner = exports.getPeopleYouMightKnow = exports.findCurrentUserDetails = void 0;
const SubscriptionSchema_1 = require("../../model/SubscriptionSchema");
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
const otpGenerator_1 = require("../../Utils/otpGenerator");
const otpService_1 = require("../../Utils/otpService");
const findCurrentUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("User ID is missing", 404);
    }
    const currentUserDetails = yield UserSchema_1.default.findById(userId).select("-password");
    if (!currentUserDetails) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    res.status(200).json({ success: true, message: "current user details", currentUserDetails });
});
exports.findCurrentUserDetails = findCurrentUserDetails;
const getPeopleYouMightKnow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const loggedInUser = yield UserSchema_1.default.findById(userId).lean();
    if (!loggedInUser) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const { skills, jobTitle, location, connecting } = loggedInUser;
    const connectedUserIds = connecting.map(conn => conn.connectionID.toString());
    const suggestedUsers = yield UserSchema_1.default.find({
        _id: { $ne: userId, $nin: connectedUserIds },
        isBlocked: false,
        isDeleted: false,
        $or: [
            { skills: { $in: skills } },
            { jobTitle: { $in: jobTitle } },
            { "location.country": location === null || location === void 0 ? void 0 : location.country, "location.state": location === null || location === void 0 ? void 0 : location.state, "location.city": location === null || location === void 0 ? void 0 : location.city }
        ]
    })
        .limit(10)
        .lean();
    res.status(200).json({ status: true, message: "found", suggestedUsers });
});
exports.getPeopleYouMightKnow = getPeopleYouMightKnow;
// export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
//     const userId = req.user?.id; 
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new CustomError("User not found",404);
//   }
//     const {
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       dateOfBirth,
//       location,
//       skills,
//       jobTitle,
//       jobLocation,
//       about,
//       education,
//       projects,
//       profileImage,
//       banner
//     } = req.body;
//     const updateData: { [key: string]: any } = {
//       ...(firstName && { firstName }),
//       ...(lastName && { lastName }),
//       ...(email && { email }),
//       ...(phoneNumber && { phoneNumber }),
//       ...(dateOfBirth && { dateOfBirth }),
//       ...(location && { location }),
//       ...(skills && { skills }),
//       ...(jobTitle && { jobTitle }),
//       ...(jobLocation && { jobLocation }),
//       ...(about && { about }),
//       ...(education && { education }),
//       ...(projects && { projects }),
//       ...(profileImage && { profileImage }),
//       ...(banner && { banner }),
//     };
//   const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//     new: true,
//   });
//     if (!updatedUser) {
//       throw new CustomError("User not found",404);
//     }
//     res.status(200).json({status:true, message: "Profile updated successfully", user: updatedUser });
// };
// update user profile //
//banner
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const { banner } = req.body;
    if (!banner) {
        throw new errorHandler_1.CustomError("Banner is required", 400);
    }
    user.banner = banner;
    yield user.save();
    res.status(200).json({ status: true, message: "Banner updated successfully", user });
});
exports.updateBanner = updateBanner;
//profile image
const updateProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const { profileImage } = req.body;
    console.log("req.body", req.body);
    if (!profileImage) {
        throw new errorHandler_1.CustomError("Profile image is required", 400);
    }
    user.profileImage = profileImage;
    console.log(user);
    yield user.save();
    res.status(200).json({ status: true, message: "Profile image updated successfully", user });
    return;
});
exports.updateProfileImage = updateProfileImage;
//personal details
const updateBasicInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const { basicInfo } = req.body;
    const { firstName, lastName, email, phoneNumber, dateOfBirth, gender, about } = basicInfo;
    const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (firstName && { firstName })), (lastName && { lastName })), (email && { email })), (phoneNumber && { phoneNumber })), (dateOfBirth && { dateOfBirth })), (gender && { gender })), (about && { about }));
    const updatedUser = yield UserSchema_1.default.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json({ status: true, message: "Basic information updated successfully", user: updatedUser });
});
exports.updateBasicInfo = updateBasicInfo;
//professional details
const updateOtherDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 404);
    }
    const { otherDetails } = req.body;
    const { location, skills, jobTitle, jobLocation, education, projects, experience } = otherDetails;
    const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (location && { location })), (skills && { skills })), (jobTitle && { jobTitle })), (jobLocation && { jobLocation })), (education && { education })), (projects && { projects })), (experience && { experience }));
    const updatedUser = yield UserSchema_1.default.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json({ status: true, message: "Other details updated successfully", user: updatedUser });
});
exports.updateOtherDetails = updateOtherDetails;
const OTP_EXPIRATION_TIME = 2 * 60 * 1000;
const otpStore = {};
const sendingOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const existingCompany = yield UserSchema_1.default.findOne({ email });
    if (existingCompany) {
        throw new errorHandler_1.CustomError("User already exists", 400);
    }
    const otp = (0, otpGenerator_1.generateOTP)();
    otpStore[email] = { otp, createdAt: Date.now() };
    yield (0, otpService_1.sendOTP)(email, otp);
    console.log(otpStore);
    res.status(200).json({
        message: "OTP sent to your email. Please verify to proceed.",
    });
});
exports.sendingOTP = sendingOTP;
const verifyingOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { otp, email } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log(otp, email);
    if (((_b = otpStore[email]) === null || _b === void 0 ? void 0 : _b.otp) !== otp.toString()) {
        throw new errorHandler_1.CustomError("Invalid OTP. Please try again.", 400);
    }
    // ✅ Mark user as  erified in DB (example: setting emailVerified = true)
    const updatedUser = yield UserSchema_1.default.findOneAndUpdate({ _id: userId }, { $set: { email: email, emailVerified: true } }, // Add other fields if needed
    { new: true });
    if (!updatedUser) {
        throw new errorHandler_1.CustomError("User not found.", 404);
    }
    delete otpStore[email];
    res.status(200).json({
        message: "OTP verified successfully.",
        user: updatedUser,
    });
});
exports.verifyingOTP = verifyingOTP;
const uploadResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const files = req.files;
    const pdfFile = (files === null || files === void 0 ? void 0 : files.resume) ? files.resume[0] : null;
    const videoFile = (files === null || files === void 0 ? void 0 : files.video) ? files.video[0] : null;
    if (!pdfFile && !videoFile) {
        throw new errorHandler_1.CustomError("No files uploaded", 400);
    }
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 400);
    }
    if (!user.resumePDF)
        user.resumePDF = [];
    if (!user.resumeVideo)
        user.resumeVideo = [];
    if (pdfFile) {
        const existingActivePDF = user.resumePDF.some((pdf) => !pdf.isDeleted);
        if (!existingActivePDF) {
            user.resumePDF.push({
                fileUrl: pdfFile.path,
                fileName: pdfFile.originalname,
                uploadedAt: new Date(),
                isDeleted: false,
            });
        }
        else {
            throw new errorHandler_1.CustomError("A resume PDF already exists.", 400);
        }
    }
    if (videoFile) {
        const existingActiveVideo = user.resumeVideo.some((video) => !video.isDeleted);
        if (!existingActiveVideo) {
            user.resumeVideo.push({
                fileUrl: videoFile.path,
                fileName: videoFile.originalname,
                uploadedAt: new Date(),
                isDeleted: false,
            });
        }
        else {
            throw new errorHandler_1.CustomError("A resume video already exists.", 400);
        }
    }
    yield user.save();
    res.status(200).json({
        success: true,
        message: "Resume uploaded successfully",
        user: Object.assign(Object.assign({}, user.toObject()), { resumePDF: user.resumePDF.filter((pdf) => !pdf.isDeleted), resumeVideo: user.resumeVideo.filter((video) => !video.isDeleted) }),
    });
});
exports.uploadResume = uploadResume;
const getUploadedFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized", 401);
    }
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 401);
    }
    const activeResumePDFs = (_b = user.resumePDF) === null || _b === void 0 ? void 0 : _b.filter((pdf) => !pdf.isDeleted);
    const activeResumeVideos = (_c = user.resumeVideo) === null || _c === void 0 ? void 0 : _c.filter((video) => !video.isDeleted);
    res.status(200).json({
        success: true,
        message: "Uploaded files retrieved successfully",
        uploadedFiles: {
            resumePDFs: activeResumePDFs,
            resumeVideos: activeResumeVideos,
        },
    });
});
exports.getUploadedFiles = getUploadedFiles;
const removeResumeFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const fileType = req.query
        .fileType;
    if (!userId) {
        throw new errorHandler_1.CustomError("Unauthorized", 401);
    }
    if (!fileType ||
        (fileType !== "resume" && fileType !== "introductionVideo")) {
        throw new errorHandler_1.CustomError("Invalid file type. Use 'pdf' or 'video'.", 400);
    }
    const user = yield UserSchema_1.default.findById(userId);
    if (!user) {
        throw new errorHandler_1.CustomError("User not found", 401);
    }
    let updatedFiles = [];
    if (fileType === "resume" && Array.isArray(user.resumePDF)) {
        user.resumePDF.forEach((resume) => {
            resume.isDeleted = true;
        });
        updatedFiles = user.resumePDF.filter((resume) => !resume.isDeleted);
    }
    else if (fileType === "introductionVideo" &&
        Array.isArray(user.resumeVideo)) {
        user.resumeVideo.forEach((resume) => {
            resume.isDeleted = true;
        });
        updatedFiles = user.resumeVideo.filter((resume) => !resume.isDeleted);
    }
    else {
        throw new errorHandler_1.CustomError(`No ${fileType} files found to mark as deleted`, 404);
    }
    yield user.save();
    res.status(200).json({
        success: true,
        message: `${fileType} files marked as deleted.`,
        files: updatedFiles,
    });
});
exports.removeResumeFile = removeResumeFile;
////////////////// ALL USER PROFILE /////////////////
const spacificuserdetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.params.id;
    if (!userid) {
        res.status(404).json({ status: false, message: "cannot find id" });
        return;
    }
    const finduserprofile = yield UserSchema_1.default.findOne({ _id: userid, isDeleted: false, isBlocked: false }).populate('connecting.connectionID');
    console.log(finduserprofile);
    if (!finduserprofile) {
        res.status(404).json({ status: false, message: "cannot find  profile" });
        return;
    }
    res
        .status(200)
        .json({ status: true, message: "All profile finded", finduserprofile });
});
exports.spacificuserdetails = spacificuserdetails;
const getTotalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const revenue = yield SubscriptionSchema_1.SubscriptionPlan.aggregate([
        {
            $match: { paymentStatus: 'completed' }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$price" }
            }
        }
    ]);
    res.status(200).json({ status: true, message: "total revenue", totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0 });
});
exports.getTotalRevenue = getTotalRevenue;
const getPrimeClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const primeClients = yield SubscriptionSchema_1.SubscriptionPlan.find({
            paymentStatus: "completed",
            active: true
        }, {
            _id: 1,
            userId: 1,
            companyId: 1,
            price: 1,
            plan: 1,
            type: 1,
            startDate: 1,
            endDate: 1,
            createdAt: 1
        });
        console.log("primeClients", primeClients);
        res.status(200).json({
            status: true,
            message: "List of prime clients (Users & Companies)",
            primeClients
        });
    }
    catch (error) {
        res.status(500).json({ status: false, message: "Internal server error", error });
    }
});
exports.getPrimeClients = getPrimeClients;
