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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const parcel_service_1 = require("./parcel.service");
const bookParcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Add customer ID from authenticated user to the request data
    const parcelData = Object.assign(Object.assign({}, req.body), { customerId: req.user.id });
    const result = yield parcel_service_1.ParcelServices.bookParcel(parcelData);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Parcel booked successfully",
        data: result.data,
    });
});
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.ParcelServices.getAllBookings();
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "All bookings retrieved successfully",
        data: result.data,
    });
});
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.user.id;
    const result = yield parcel_service_1.ParcelServices.getCustomerBookings(customerId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Your bookings retrieved successfully",
        data: result.data,
    });
});
const updateAssignedAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parcelId } = req.params;
    const { agentId } = req.body;
    // Validate required fields
    if (!agentId) {
        return res.status(400).json({
            success: false,
            message: "Agent ID is required",
        });
    }
    const result = yield parcel_service_1.ParcelServices.updateAssignedAgent(parcelId, agentId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Assigned agent updated successfully",
        data: result.data,
    });
});
const deleteParcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parcelId } = req.params;
    const result = yield parcel_service_1.ParcelServices.deleteParcel(parcelId);
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
const updateParcelStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parcelId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;
    // Validate required fields
    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required",
        });
    }
    // Validate status values
    const validStatuses = ["Pending", "Picked Up", "In Transit", "Delivered", "Failed"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status value",
        });
    }
    const result = yield parcel_service_1.ParcelServices.updateParcelStatus(parcelId, status, agentId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Parcel status updated successfully",
        data: result.data,
    });
});
const getAgentDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agentId = req.user.id;
    const result = yield parcel_service_1.ParcelServices.getAgentDashboard(agentId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Agent dashboard data retrieved successfully",
        data: result.data,
    });
});
const trackParcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const result = yield parcel_service_1.ParcelServices.trackParcel(trackingId);
    // Handle error responses
    if (!result.success) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }
    res.status(result.status).json({
        success: true,
        message: "Parcel tracking data retrieved successfully",
        data: result.data,
    });
});
exports.ParcelController = {
    bookParcel,
    getAllBookings,
    getMyBookings,
    updateAssignedAgent,
    deleteParcel,
    updateParcelStatus,
    getAgentDashboard,
    trackParcel
};
