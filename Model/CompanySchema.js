"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const banner = "https://res.cloudinary.com/dq1auwpkm/image/upload/v1740220803/linkedinheaders-desktop_fw5iio.jpg";
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    about: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, },
    contact: { type: Number, required: true },
    banner: {
        type: String,
        default: banner,
    },
    founder: { type: String, require: true },
    foundedAt: { type: Date },
    headquarters: { type: String },
    employees: [
        {
            employee: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
            //  employee: { type: String}, 
            position: { type: String },
        },
    ],
    deletionReasons: [{ type: String }],
    role: {
        type: String,
        enum: ["company", "premium"],
        default: "company",
    },
    type: { type: String },
    IndustryType: { type: String, required: false },
    address: {
        pincode: { type: String, },
        landmark: { type: String },
        city: { type: String, },
        state: { type: String, },
        country: { type: String, required: true },
    },
    followers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    socialMedia: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
    },
    subscriptionEndDate: { type: Date, default: null },
    subscriptionStartDate: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    services: [
        { type: String, require }
    ],
    workHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "5:00" }
    }
}, { timestamps: true });
exports.Company = mongoose_1.default.model("Company", CompanySchema);
