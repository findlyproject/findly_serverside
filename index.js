"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbconections_1 = require("./config/dbconections");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = require("./routes/userRoutes");
const ratingRoutes_1 = require("./routes/ratingRoutes");
const PaymentRoutes_1 = require("./routes/PaymentRoutes");
const searchRoutes_1 = require("./routes/searchRoutes");
const AdminRoutes_1 = require("./routes/AdminRoutes");
const customClassMiddleware_1 = __importDefault(require("./middleware/customClassMiddleware"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const connectionRoutes_1 = require("./routes/connectionRoutes");
const compnayRoutes_1 = require("./routes/compnayRoutes");
const socket_1 = require("./socket");
const messageRoute_1 = require("./routes/messageRoute");
console.log("heloooooooooo");
dotenv_1.default.config();
// const app = express();
socket_1.app.use(express_1.default.json({ limit: "50mb" })); // Increase JSON payload size
socket_1.app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" })); // Increase URL-encoded payload size
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
socket_1.app.use("/api/user", userRoutes_1.userRouter);
socket_1.app.use("/api/rating", ratingRoutes_1.ratingRouter);
socket_1.app.use("/api/post", postRoutes_1.default);
socket_1.app.use("/api/payment", PaymentRoutes_1.paymentRouter);
socket_1.app.use("/api/user", searchRoutes_1.searchRouter);
socket_1.app.use("/api/connecting", connectionRoutes_1.connectionRouter);
socket_1.app.use("/api/admin", AdminRoutes_1.adminRouter);
socket_1.app.use("/api/company", compnayRoutes_1.companyRouter);
socket_1.app.use("/api/message", messageRoute_1.messageRoute);
socket_1.app.use(customClassMiddleware_1.default);
(0, dbconections_1.connectMongodb)();
const PORT = process.env.PORT || 4000;
socket_1.server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
