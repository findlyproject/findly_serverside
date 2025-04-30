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
exports.allUsersforCompany = exports.BannerOfCompany = exports.LogoOfCompany = exports.editemployee = exports.removeEmployee = exports.editsocialmedia = exports.EditServiecs = exports.EditProfetional = exports.EditContacts = exports.EditCompany = exports.spacificCompanyDetails = exports.findComapanies = void 0;
const CompanySchema_1 = require("../../model/CompanySchema");
const UserSchema_1 = __importDefault(require("../../model/UserSchema"));
const errorHandler_1 = require("../../Utils/errorHandler");
const findComapanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companies = yield CompanySchema_1.Company.find();
    res.status(200).json({ success: true, message: "founded", companies });
});
exports.findComapanies = findComapanies;
const spacificCompanyDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.companyId;
    if (!companyId) {
        res.status(404).json({ status: false, message: "cannot find id" });
        return;
    }
    const findCompanyprofile = yield CompanySchema_1.Company.findOne({ _id: companyId, isDeleted: false, isBlocked: false });
    if (!findCompanyprofile) {
        res.status(404).json({ status: false, message: "cannot find  profile" });
        return;
    }
    res
        .status(200)
        .json({ status: true, message: " profile finded", findCompanyprofile });
});
exports.spacificCompanyDetails = spacificCompanyDetails;
const EditCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { about } = req.body;
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    // company.name=name
    // company.contact=contact
    // company.founder=founder
    // company.foundedAt=foundedAt
    company.about = about;
    // company.IndustryType=IndustryType
    // company.address=address
    // company.socialMedia=socialMedia
    // company.services=services
    // company.workHours=workHours
    // company.employees=employees||[]
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully edited', company });
});
exports.EditCompany = EditCompany;
const EditContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { name, contact, founder, email } = req.body;
    console.log("nameeeeeeeeeeeeeeeeeeeeeeeeeee", name);
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    company.name = name;
    company.contact = contact;
    company.founder = founder;
    company.email = email;
    // company.foundedAt=foundedAt
    // company.about=about
    // company.IndustryType=IndustryType
    // company.address=address
    // company.socialMedia=socialMedia
    // company.services=services
    // company.workHours=workHours
    // company.employees=employees||[]
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully edited', company });
});
exports.EditContacts = EditContacts;
const EditProfetional = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { name, address, email } = req.body;
    console.log("narrrrrrrrrrrrrrrrrrrrrrr", name);
    console.log("address", address);
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    company.name = name;
    company.email = email;
    // company.foundedAt=foundedAt
    // company.about=about
    // company.IndustryType=IndustryType
    company.address = address;
    // company.socialMedia=socialMedia
    // company.services=services
    // company.workHours=workHours
    // company.employees=employees||[]
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully edited', company });
});
exports.EditProfetional = EditProfetional;
const EditServiecs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { services } = req.body;
    console.log("narrrrrrrrrrrrrrrrrrrrrrr", services);
    console.log("req.body", req.body);
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    company.services = services;
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully edited', company });
});
exports.EditServiecs = EditServiecs;
const editsocialmedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const { socialMedia } = req.body;
    console.log("socialMedia", socialMedia);
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    company.socialMedia = socialMedia;
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully edited', company });
});
exports.editsocialmedia = editsocialmedia;
const removeEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.params.id;
        const { email } = req.body;
        console.log("req.body", req.body);
        // 1. Find company
        const company = yield CompanySchema_1.Company.findById(companyId);
        if (!company) {
            res.status(404).json({ success: false, message: "Company not found" });
            return;
        }
        // 2. Find the user by email
        const user = yield UserSchema_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // 3. Remove employee from company
        const updatedEmployees = company.employees.filter((emp) => emp.employee.toString() !== user._id.toString());
        company.employees = updatedEmployees;
        yield company.save();
        const updatedCompany = yield CompanySchema_1.Company.findById(companyId).populate("employees.employee");
        res.status(200).json({
            status: true,
            message: "Employee removed successfully",
            company: updatedCompany,
        });
    }
    catch (error) {
        console.error("Error removing employee:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
exports.removeEmployee = removeEmployee;
const editemployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.params.id;
        const { employee, position, email } = req.body.employees;
        console.log("body", req.body);
        // 1. Check if company exists
        const company = yield CompanySchema_1.Company.findById(companyId);
        if (!company) {
            res.status(404).json({ success: false, message: "company not found" });
            return;
        }
        console.log("emm", email);
        const user = yield UserSchema_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // 3. Check if employee already exists in company
        const existingIndex = company.employees.findIndex((emp) => emp.employee.toString() === user._id.toString());
        if (existingIndex !== -1) {
            // Update position if already exists
            company.employees[existingIndex].position = position;
        }
        else {
            // Push new employee
            company.employees.push({
                employee: user._id,
                position: position,
            });
        }
        yield company.save();
        // 4. Populate employee data for response
        const updatedCompany = yield CompanySchema_1.Company.findById(companyId).populate("employees.employee");
        res.status(200).json({
            status: true,
            message: "Successfully edited employees",
            company: updatedCompany,
        });
    }
    catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
exports.editemployee = editemployee;
const LogoOfCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    if (req.file) {
        company.logo = req.file.path;
    }
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully updated', company });
});
exports.LogoOfCompany = LogoOfCompany;
const BannerOfCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = req.params.id;
    const company = yield CompanySchema_1.Company.findById(companyId);
    if (!company) {
        throw new errorHandler_1.CustomError("company not found", 404);
    }
    if (req.file) {
        company.banner = req.file.path;
    }
    yield company.save();
    res.status(200).json({ status: true, message: 'successfully updated', company });
});
exports.BannerOfCompany = BannerOfCompany;
const allUsersforCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    console.log("query", query);
    if (!query) {
        throw new errorHandler_1.CustomError(`query is required`, 400);
    }
    const users = yield UserSchema_1.default.find({ firstName: { $regex: query, $options: "i" } });
    if (!users) {
        throw new errorHandler_1.CustomError(`users not found`, 404);
    }
    res.status(200).json({ status: true, message: 'success', users });
});
exports.allUsersforCompany = allUsersforCompany;
