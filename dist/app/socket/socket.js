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
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const parcel_model_1 = require("../modules/parcels/parcel.model");
const auth_model_1 = require("../modules/auth/auth.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const cookie = __importStar(require("cookie"));
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials: true,
        },
    });
    // Authentication middleware for socket (HTTP Cookie based)
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const token = cookies.token;
            if (!token) {
                return next(new Error("Authentication error: No token in cookies"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_secret);
            const user = yield auth_model_1.UserModel.findById(decoded.id).select("-password");
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.userId = user._id.toString();
            socket.userRole = user.role;
            next();
        }
        catch (error) {
            next(new Error(`Authentication error: ${error}`));
        }
    }));
    io.on("connection", (socket) => {
        // Agent joins their personal room for receiving assignments
        if (socket.userRole === "agent") {
            socket.join(`agent_${socket.userId}`);
        }
        // Handle disconnection
        socket.on("disconnect", (reason) => {
            // Connection cleanup handled automatically
        });
        // Handle agent location updates
        socket.on("agent_location_update", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (socket.userRole !== "agent") {
                    socket.emit("error", {
                        message: "Only agents can update location",
                    });
                    return;
                }
                const { lat, lng } = data;
                // Update agent location in all assigned parcels
                const updateResult = yield parcel_model_1.ParcelModel.updateMany({ assignedAgent: socket.userId }, {
                    $set: {
                        agentLocation: { lat, lng },
                    },
                });
                // Get all parcels assigned to this agent
                const parcels = yield parcel_model_1.ParcelModel.find({
                    assignedAgent: socket.userId,
                });
                // Emit location update to all tracking rooms
                parcels.forEach((parcel) => {
                    const roomName = `tracking_${parcel.trackingId}`;
                    socket.to(roomName).emit("agent_location", {
                        trackingId: parcel.trackingId,
                        agentLocation: { lat, lng },
                        status: parcel.status,
                        timestamp: new Date(),
                    });
                });
                socket.emit("location_updated", {
                    message: "Location updated successfully",
                    location: { lat, lng },
                });
            }
            catch (error) {
                socket.emit("error", { message: "Failed to update location" });
            }
        }));
        // Handle customer tracking parcel
        socket.on("track_parcel", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { trackingId } = data;
                // Find the parcel
                const parcel = yield parcel_model_1.ParcelModel.findOne({ trackingId })
                    .populate("customer", "name email")
                    .populate("assignedAgent", "name email");
                if (!parcel) {
                    socket.emit("tracking_error", { message: "Parcel not found" });
                    return;
                }
                // Join tracking room
                const roomName = `tracking_${trackingId}`;
                socket.join(roomName);
                // Send initial parcel data
                const parcelData = {
                    trackingId: parcel.trackingId,
                    status: parcel.status,
                    senderInfo: parcel.senderInfo,
                    receiverInfo: parcel.receiverInfo,
                    parcelDetails: parcel.parcelDetails,
                    pickupSchedule: parcel.pickupSchedule,
                    assignedAgent: parcel.assignedAgent,
                    agentLocation: parcel.agentLocation,
                    lastUpdated: parcel.updatedAt,
                };
                socket.emit("parcel_data", parcelData);
            }
            catch (error) {
                socket.emit("tracking_error", { message: "Failed to track parcel" });
            }
        }));
        // Handle leaving tracking room
        socket.on("stop_tracking", (data) => {
            const { trackingId } = data;
            const roomName = `tracking_${trackingId}`;
            socket.leave(roomName);
        });
        // Handle status updates from agents
        socket.on("update_parcel_status", (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                if (socket.userRole !== "agent") {
                    socket.emit("error", { message: "Only agents can update status" });
                    return;
                }
                const { parcelId, status } = data;
                // Find and update parcel
                const parcel = yield parcel_model_1.ParcelModel.findById(parcelId);
                if (!parcel || ((_a = parcel.assignedAgent) === null || _a === void 0 ? void 0 : _a.toString()) !== socket.userId) {
                    socket.emit("error", {
                        message: "Unauthorized or parcel not found",
                    });
                    return;
                }
                // Update status
                parcel.status = status;
                yield parcel.save();
                // Notify tracking room about status change
                const roomName = `tracking_${parcel.trackingId}`;
                socket.to(roomName).emit("status_update", {
                    trackingId: parcel.trackingId,
                    status: status,
                    timestamp: new Date(),
                });
                socket.emit("status_updated", {
                    message: "Status updated successfully",
                    parcelId,
                    status,
                });
            }
            catch (error) {
                socket.emit("error", { message: "Failed to update status" });
            }
        }));
        socket.on("disconnect", () => {
            // Cleanup on disconnect
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
