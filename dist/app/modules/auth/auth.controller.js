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
exports.AuthController = void 0;
const auth_services_1 = require("./auth.services");
const config_1 = __importDefault(require("../../config"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.registerUser(req.body);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    // Set secure cookie for successful registration
    if (result.data) {
        res.cookie("token", result.data.token, {
            httpOnly: true,
            secure: config_1.default.node_environment === "development" ? false : true,
            sameSite: config_1.default.node_environment === "development" ? "lax" : "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
    res.status(result.status).json({
        success: true,
        message: "User registered successfully",
        data: result.data,
    });
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.loginUser(req.body);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    // Set secure cookie for successful login
    if (result.data) {
        res.cookie("token", result.data.token, {
            httpOnly: true,
            secure: config_1.default.node_environment === "development" ? false : true,
            sameSite: config_1.default.node_environment === "development" ? "lax" : "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Login successful",
        data: result.data,
    });
});
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    const result = yield auth_services_1.AuthServices.getMe(userId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "User data retrieved successfully",
        data: result.data,
    });
});
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.logoutUser();
    // Clear the authentication cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: config_1.default.node_environment === "production",
        sameSite: "strict",
    });
    res.status(result.status).json({
        success: true,
        message: result.message,
    });
});
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.getAllUsers();
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "All users retrieved successfully",
        data: result.data,
    });
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield auth_services_1.AuthServices.deleteUser(userId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: result.message,
    });
});
exports.AuthController = { registerUser, loginUser, getMe, logoutUser, getAllUsers, deleteUser };
