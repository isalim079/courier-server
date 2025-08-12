"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = require("./app/modules/auth/auth.route");
const parcel_route_1 = require("./app/modules/parcels/parcel.route");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/api/v1/auth", auth_route_1.AuthRoutes);
app.use("/api/v1/parcel", parcel_route_1.ParcelRoutes);
app.get("/", (req, res) => {
    res.send(`Courier api is live... 🚀`);
});
exports.default = app;
