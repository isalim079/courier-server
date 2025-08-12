"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelModel = void 0;
const mongoose_1 = require("mongoose");
const locationSchema = new mongoose_1.Schema({
    lat: {
        type: Number,
        required: false,
    },
    lng: {
        type: Number,
        required: false,
    },
}, { _id: false });
const addressSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address1: {
        type: String,
        required: true,
        trim: true,
    },
    address2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: locationSchema,
        required: false,
    },
}, { _id: false });
const parcelDetailsSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["small", "medium", "large"],
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    specialInstructions: {
        type: String,
        trim: true,
    },
}, { _id: false });
const paymentSchema = new mongoose_1.Schema({
    method: {
        type: String,
        enum: ["COD"],
        required: true,
    },
    codAmount: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });
const parcelSchema = new mongoose_1.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderInfo: {
        type: addressSchema,
        required: true,
    },
    receiverInfo: {
        type: addressSchema,
        required: true,
    },
    parcelDetails: {
        type: parcelDetailsSchema,
        required: true,
    },
    payment: {
        type: paymentSchema,
        required: true,
    },
    pickupSchedule: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Picked Up", "In Transit", "Delivered", "Failed"],
        default: "Pending",
    },
    assignedAgent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    agentLocation: { type: locationSchema, default: null }
}, {
    timestamps: true,
});
// Index for faster queries
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ customer: 1 });
parcelSchema.index({ assignedAgent: 1 });
exports.ParcelModel = (0, mongoose_1.model)("parcelDB", parcelSchema);
