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
exports.ParcelServices = void 0;
const parcel_model_1 = require("./parcel.model");
const config_1 = __importDefault(require("../../config"));
// Generate unique tracking ID
const generateTrackingId = () => {
    const prefix = "trkId";
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
};
// Convert address to coordinates using Google Geocoding API
const getCoordinatesFromAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fullAddress = `${address.address1}, ${address.city}, ${address.postalCode}`;
        const encodedAddress = encodeURIComponent(fullAddress);
        const apiKey = config_1.default.google_map_api_key;
        const response = yield fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`);
        const data = yield response.json();
        if (data.status === "OK" && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                success: true,
                coordinates: {
                    lat: location.lat,
                    lng: location.lng,
                },
            };
        }
        else {
            return {
                success: false,
                message: "Address not found or invalid",
            };
        }
    }
    catch (error) {
        return {
            success: false,
            message: `Geocoding failed: ${error.message}`,
        };
    }
});
const bookParcel = (parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate unique tracking ID
        let trackingId = generateTrackingId();
        // Ensure tracking ID is unique (in case of collision)
        let existingParcel = yield parcel_model_1.ParcelModel.findOne({ trackingId });
        while (existingParcel) {
            trackingId = generateTrackingId();
            existingParcel = yield parcel_model_1.ParcelModel.findOne({ trackingId });
        }
        // Convert pickup schedule string to Date
        const pickupSchedule = new Date(parcelData.pickupSchedule);
        // Validate pickup schedule is in the future
        if (pickupSchedule <= new Date()) {
            return {
                success: false,
                status: 400,
                message: "Pickup schedule must be in the future",
            };
        }
        // Get coordinates for receiver address using Google Geocoding API
        const geocodingResult = yield getCoordinatesFromAddress(parcelData.receiverInfo);
        // Check if geocoding was successful
        if (!geocodingResult.success) {
            return {
                success: false,
                status: 400,
                message: geocodingResult.message,
            };
        }
        // Add coordinates to receiver info
        const receiverInfoWithLocation = Object.assign(Object.assign({}, parcelData.receiverInfo), { location: geocodingResult.coordinates });
        // Create new parcel
        const parcel = yield parcel_model_1.ParcelModel.create({
            trackingId,
            customer: parcelData.customerId,
            senderInfo: parcelData.senderInfo,
            receiverInfo: receiverInfoWithLocation,
            parcelDetails: parcelData.parcelDetails,
            payment: parcelData.payment,
            pickupSchedule,
            status: "Pending",
        });
        // Populate customer info
        yield parcel.populate("customer", "name email");
        // Return parcel data
        const parcelResponse = {
            id: parcel._id,
            trackingId: parcel.trackingId,
            customer: parcel.customer,
            senderInfo: parcel.senderInfo,
            receiverInfo: parcel.receiverInfo,
            parcelDetails: parcel.parcelDetails,
            payment: parcel.payment,
            pickupSchedule: parcel.pickupSchedule,
            status: parcel.status,
            assignedAgent: parcel.assignedAgent,
        };
        return {
            success: true,
            status: 201,
            data: {
                parcel: parcelResponse,
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
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const parcels = yield parcel_model_1.ParcelModel.find({})
            .populate("customer", "name email")
            .populate("assignedAgent", "name email")
            .sort({ createdAt: -1 });
        const parcelsResponse = parcels.map((parcel) => ({
            id: parcel._id,
            trackingId: parcel.trackingId,
            customer: parcel.customer,
            senderInfo: parcel.senderInfo,
            receiverInfo: parcel.receiverInfo,
            parcelDetails: parcel.parcelDetails,
            payment: parcel.payment,
            pickupSchedule: parcel.pickupSchedule,
            status: parcel.status,
            assignedAgent: parcel.assignedAgent,
        }));
        // Get delivery status counts
        const statusCounts = yield parcel_model_1.ParcelModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Create status summary
        const deliveryStats = {
            pendingPickups: ((_a = statusCounts.find((status) => status._id === "Pending")) === null || _a === void 0 ? void 0 : _a.count) || 0,
            activeDeliveries: statusCounts
                .filter((status) => ["Picked Up", "In Transit"].includes(status._id))
                .reduce((sum, item) => sum + item.count, 0),
            completedDeliveries: ((_b = statusCounts.find((status) => status._id === "Delivered")) === null || _b === void 0 ? void 0 : _b.count) || 0,
            failedDeliveries: ((_c = statusCounts.find((status) => status._id === "Failed")) === null || _c === void 0 ? void 0 : _c.count) || 0,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcels: parcelsResponse,
                total: parcels.length,
                deliveryStats,
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
const getCustomerBookings = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const parcels = yield parcel_model_1.ParcelModel.find({ customer: customerId })
            .populate("customer", "name email")
            .populate("assignedAgent", "name email")
            .sort({ createdAt: -1 });
        const parcelsResponse = parcels.map((parcel) => ({
            id: parcel._id,
            trackingId: parcel.trackingId,
            customer: parcel.customer,
            senderInfo: parcel.senderInfo,
            receiverInfo: parcel.receiverInfo,
            parcelDetails: parcel.parcelDetails,
            payment: parcel.payment,
            pickupSchedule: parcel.pickupSchedule,
            status: parcel.status,
            assignedAgent: parcel.assignedAgent,
        }));
        // Get delivery status counts for this customer
        const { Types } = require("mongoose");
        const statusCounts = yield parcel_model_1.ParcelModel.aggregate([
            { $match: { customer: new Types.ObjectId(customerId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Create status summary
        const deliveryStats = {
            pendingPickups: ((_a = statusCounts.find((status) => status._id === "Pending")) === null || _a === void 0 ? void 0 : _a.count) || 0,
            activeDeliveries: statusCounts
                .filter((status) => ["Picked Up", "In Transit"].includes(status._id))
                .reduce((sum, item) => sum + item.count, 0),
            completedDeliveries: ((_b = statusCounts.find((status) => status._id === "Delivered")) === null || _b === void 0 ? void 0 : _b.count) || 0,
            failedDeliveries: ((_c = statusCounts.find((status) => status._id === "Failed")) === null || _c === void 0 ? void 0 : _c.count) || 0,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcels: parcelsResponse,
                total: parcels.length,
                deliveryStats,
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
const updateAssignedAgent = (parcelId, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the parcel
        const parcel = yield parcel_model_1.ParcelModel.findById(parcelId);
        if (!parcel) {
            return {
                success: false,
                status: 404,
                message: "Parcel not found",
            };
        }
        // Update the assigned agent
        const updatedParcel = yield parcel_model_1.ParcelModel.findByIdAndUpdate(parcelId, { assignedAgent: agentId }, { new: true })
            .populate("customer", "name email")
            .populate("assignedAgent", "name email");
        // Return updated parcel data
        const parcelResponse = {
            id: updatedParcel._id,
            trackingId: updatedParcel.trackingId,
            customer: updatedParcel.customer,
            senderInfo: updatedParcel.senderInfo,
            receiverInfo: updatedParcel.receiverInfo,
            parcelDetails: updatedParcel.parcelDetails,
            payment: updatedParcel.payment,
            pickupSchedule: updatedParcel.pickupSchedule,
            status: updatedParcel.status,
            assignedAgent: updatedParcel.assignedAgent,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcel: parcelResponse,
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
const deleteParcel = (parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find and delete the parcel
        const parcel = yield parcel_model_1.ParcelModel.findByIdAndDelete(parcelId);
        if (!parcel) {
            return {
                success: false,
                status: 404,
                message: "Parcel not found",
            };
        }
        return {
            success: true,
            status: 200,
            message: "Parcel deleted successfully",
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
const updateParcelStatus = (parcelId, status, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Find the parcel and verify it's assigned to this agent
        const parcel = yield parcel_model_1.ParcelModel.findById(parcelId);
        if (!parcel) {
            return {
                success: false,
                status: 404,
                message: "Parcel not found",
            };
        }
        // Check if the parcel is assigned to this agent
        if (((_a = parcel.assignedAgent) === null || _a === void 0 ? void 0 : _a.toString()) !== agentId) {
            return {
                success: false,
                status: 403,
                message: "You can only update parcels assigned to you",
            };
        }
        // Update the status
        const updatedParcel = yield parcel_model_1.ParcelModel.findByIdAndUpdate(parcelId, { status }, { new: true })
            .populate("customer", "name email")
            .populate("assignedAgent", "name email");
        // Return updated parcel data
        const parcelResponse = {
            id: updatedParcel._id,
            trackingId: updatedParcel.trackingId,
            customer: updatedParcel.customer,
            senderInfo: updatedParcel.senderInfo,
            receiverInfo: updatedParcel.receiverInfo,
            parcelDetails: updatedParcel.parcelDetails,
            payment: updatedParcel.payment,
            pickupSchedule: updatedParcel.pickupSchedule,
            status: updatedParcel.status,
            assignedAgent: updatedParcel.assignedAgent,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcel: parcelResponse,
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
const getAgentDashboard = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Get all parcels assigned to this agent
        const parcels = yield parcel_model_1.ParcelModel.find({ assignedAgent: agentId })
            .populate("customer", "name email")
            .sort({ createdAt: -1 });
        const parcelsResponse = parcels.map((parcel) => ({
            id: parcel._id,
            trackingId: parcel.trackingId,
            customer: parcel.customer,
            senderInfo: parcel.senderInfo,
            receiverInfo: parcel.receiverInfo,
            parcelDetails: parcel.parcelDetails,
            payment: parcel.payment,
            pickupSchedule: parcel.pickupSchedule,
            status: parcel.status,
        }));
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        // Get parcels assigned today
        const parcelsAssignedToday = yield parcel_model_1.ParcelModel.find({
            assignedAgent: agentId,
            updatedAt: { $gte: startOfDay, $lt: endOfDay },
        });
        // Get status counts for this agent
        const { Types } = require("mongoose");
        const statusCounts = yield parcel_model_1.ParcelModel.aggregate([
            { $match: { assignedAgent: new Types.ObjectId(agentId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Create statistics
        const agentStats = {
            totalAssigned: parcels.length,
            assignedToday: parcelsAssignedToday.length,
            pendingPickups: ((_a = statusCounts.find((status) => status._id === "Pending")) === null || _a === void 0 ? void 0 : _a.count) || 0,
            inProgress: statusCounts
                .filter((status) => ["Picked Up", "In Transit"].includes(status._id))
                .reduce((sum, item) => sum + item.count, 0),
            completed: ((_b = statusCounts.find((status) => status._id === "Delivered")) === null || _b === void 0 ? void 0 : _b.count) || 0,
            failed: ((_c = statusCounts.find((status) => status._id === "Failed")) === null || _c === void 0 ? void 0 : _c.count) || 0,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcels: parcelsResponse,
                statistics: agentStats,
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
const trackParcel = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parcel = yield parcel_model_1.ParcelModel.findOne({ trackingId })
            .populate("customer", "name email")
            .populate("assignedAgent", "name email");
        if (!parcel) {
            return {
                success: false,
                status: 404,
                message: "Parcel not found",
            };
        }
        const parcelResponse = {
            id: parcel._id,
            trackingId: parcel.trackingId,
            customer: parcel.customer,
            senderInfo: parcel.senderInfo,
            receiverInfo: parcel.receiverInfo,
            parcelDetails: parcel.parcelDetails,
            payment: parcel.payment,
            pickupSchedule: parcel.pickupSchedule,
            status: parcel.status,
            assignedAgent: parcel.assignedAgent,
            agentLocation: parcel.agentLocation,
            createdAt: parcel.createdAt,
            updatedAt: parcel.updatedAt,
        };
        return {
            success: true,
            status: 200,
            data: {
                parcel: parcelResponse,
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
exports.ParcelServices = {
    bookParcel,
    getAllBookings,
    getCustomerBookings,
    updateAssignedAgent,
    deleteParcel,
    updateParcelStatus,
    getAgentDashboard,
    trackParcel,
};
