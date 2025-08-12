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
exports.AuthServices = void 0;
const auth_model_1 = require("./auth.model");
const generateToken_1 = require("../../utils/generateToken");
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = userData;
    // Input validation
    if (!name || !email || !password) {
        return {
            success: false,
            status: 400,
            message: "Name, email, and password are required",
        };
    }
    try {
        // Check if user already exists
        const existingUser = yield auth_model_1.UserModel.findOne({ email });
        if (existingUser) {
            return {
                success: false,
                status: 409,
                message: "User with this email already exists",
            };
        }
        // Create new user
        const user = yield auth_model_1.UserModel.create({
            name,
            email,
            password,
            role: role || "customer",
        });
        // Generate token
        const token = (0, generateToken_1.generateToken)(user);
        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return {
            success: true,
            status: 201,
            data: {
                user: userResponse,
                token,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message,
        };
    }
});
const loginUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = userData;
    // Input validation
    if (!email || !password) {
        return {
            success: false,
            status: 400,
            message: "Email and password are required",
        };
    }
    try {
        // Find user by email
        const user = yield auth_model_1.UserModel.findOne({ email });
        if (!user) {
            return {
                success: false,
                status: 401,
                message: "Invalid email or password",
            };
        }
        // Check password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                status: 401,
                message: "Invalid email or password",
            };
        }
        // Generate token
        const token = (0, generateToken_1.generateToken)(user);
        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return {
            success: true,
            status: 200,
            data: {
                user: userResponse,
                token,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message,
        };
    }
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by ID
        const user = yield auth_model_1.UserModel.findById(userId).select("-password");
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return {
            success: true,
            status: 200,
            data: {
                user: userResponse,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message,
        };
    }
});
const logoutUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: true,
        status: 200,
        message: "Logged out successfully",
    };
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Get all users without password
        const users = yield auth_model_1.UserModel.find({})
            .select("-password")
            .sort({ createdAt: -1 });
        const usersResponse = users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }));
        // Get role counts using aggregation
        const roleCounts = yield auth_model_1.UserModel.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Extract counts for each role
        const adminCount = ((_a = roleCounts.find((role) => role._id === "admin")) === null || _a === void 0 ? void 0 : _a.count) || 0;
        const customerCount = ((_b = roleCounts.find((role) => role._id === "customer")) === null || _b === void 0 ? void 0 : _b.count) || 0;
        const agentCount = ((_c = roleCounts.find((role) => role._id === "agent")) === null || _c === void 0 ? void 0 : _c.count) || 0;
        // Filter users by role
        const admins = usersResponse.filter((user) => user.role === "admin");
        const customers = usersResponse.filter((user) => user.role === "customer");
        const agents = usersResponse.filter((user) => user.role === "agent");
        return {
            success: true,
            status: 200,
            data: {
                totalUsers: {
                    total: users.length,
                    users: usersResponse,
                },
                totalAdmins: {
                    total: adminCount,
                    users: admins,
                },
                totalCustomers: {
                    total: customerCount,
                    users: customers,
                },
                totalAgents: {
                    total: agentCount,
                    users: agents,
                },
            },
        };
    }
    catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message,
        };
    }
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find and delete the user
        const user = yield auth_model_1.UserModel.findByIdAndDelete(userId);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: "User not found",
            };
        }
        return {
            success: true,
            status: 200,
            message: "User deleted successfully",
        };
    }
    catch (error) {
        return {
            success: false,
            status: 500,
            message: error.message,
        };
    }
});
exports.AuthServices = {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    getAllUsers,
    deleteUser,
};
