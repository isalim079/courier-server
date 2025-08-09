import { Schema, model, Document, Types } from "mongoose";
import { TParcel } from "./parcel.interface";

export interface IParcelDocument
  extends Omit<TParcel, "assignedAgent">,
    Document {
  assignedAgent?: Types.ObjectId | null;
}

const locationSchema = new Schema(
  {
    lat: {
      type: Number,
      required: false,
    },
    lng: {
      type: Number,
      required: false,
    },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
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
  },
  { _id: false }
);

const parcelDetailsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
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
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
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
  },
  { _id: false }
);

const parcelSchema = new Schema<IParcelDocument>(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
parcelSchema.index({ trackingId: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ assignedAgent: 1 });

export const ParcelModel = model<IParcelDocument>("parcelDB", parcelSchema);
