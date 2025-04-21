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
exports.reportuser = void 0;
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const ReportSchema_1 = require("../../model/ReportSchema");
//////////////////// REPORT USER ////////////
const reportuser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { reason, repoteduserid } = req.body;
    if (!userid) {
        res.status(400).json({ status: false, message: "User ID is missing" });
        return;
    }
    const finduser = yield UserSchema_1.default.findOne({ _id: userid });
    if (!finduser) {
        res.status(404).json({ status: false, message: "User not found" });
        return;
    }
    if (!repoteduserid) {
        res.status(400).json({ status: false, message: "Reported user ID is missing" });
        return;
    }
    const findreporteduser = yield UserSchema_1.default.findOne({ _id: repoteduserid }).populate("reports");
    if (!findreporteduser) {
        res.status(404).json({ status: false, message: "Reported user not found" });
        return;
    }
    const report = new ReportSchema_1.Report({
        reportedBy: userid,
        reason,
    });
    yield report.save();
    if (!Array.isArray(findreporteduser.reports)) {
        findreporteduser.reports = [];
    }
    findreporteduser.reports.push(report.id);
    yield findreporteduser.save();
    const popuatedreports = yield UserSchema_1.default.findOne({ _id: repoteduserid }).populate("reports");
    res.status(200).json({ status: true, message: "Reported successfully", popuatedreports });
});
exports.reportuser = reportuser;
