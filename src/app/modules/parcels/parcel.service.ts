import { ParcelModel } from "./parcel.model";
import config from "../../config";

// Generate unique tracking ID
const generateTrackingId = (): string => {
  const prefix = "trkId";
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Convert address to coordinates using Google Geocoding API
const getCoordinatesFromAddress = async (address: any) => {
  try {
    const fullAddress = `${address.address1}, ${address.city}, ${address.postalCode}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const apiKey = config.google_map_api_key;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
      };
    } else {
      return {
        success: false,
        message: "Address not found or invalid",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Geocoding failed: ${error.message}`,
    };
  }
};

const bookParcel = async (parcelData: any) => {
  try {
    // Generate unique tracking ID
    let trackingId = generateTrackingId();

    // Ensure tracking ID is unique (in case of collision)
    let existingParcel = await ParcelModel.findOne({ trackingId });
    while (existingParcel) {
      trackingId = generateTrackingId();
      existingParcel = await ParcelModel.findOne({ trackingId });
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
    const geocodingResult = await getCoordinatesFromAddress(
      parcelData.receiverInfo
    );

    // Check if geocoding was successful
    if (!geocodingResult.success) {
      return {
        success: false,
        status: 400,
        message: geocodingResult.message,
      };
    }

    // Add coordinates to receiver info
    const receiverInfoWithLocation = {
      ...parcelData.receiverInfo,
      location: geocodingResult.coordinates,
    };

    // Create new parcel
    const parcel = await ParcelModel.create({
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
    await parcel.populate("customer", "name email");

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
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const getAllBookings = async () => {
  try {
    const parcels = await ParcelModel.find({})
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
    const statusCounts = await ParcelModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Create status summary
    const deliveryStats = {
      pendingPickups: statusCounts.find((s) => s._id === "Pending")?.count || 0,
      activeDeliveries: statusCounts
        .filter((s) => ["Picked Up", "In Transit"].includes(s._id))
        .reduce((sum, item) => sum + item.count, 0),
      completedDeliveries:
        statusCounts.find((s) => s._id === "Delivered")?.count || 0,
      failedDeliveries:
        statusCounts.find((s) => s._id === "Failed")?.count || 0,
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
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const getCustomerBookings = async (customerId: string) => {
  try {
    const parcels = await ParcelModel.find({ customer: customerId })
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
    const statusCounts = await ParcelModel.aggregate([
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
      pendingPickups: statusCounts.find((s) => s._id === "Pending")?.count || 0,
      activeDeliveries: statusCounts
        .filter((s) => ["Picked Up", "In Transit"].includes(s._id))
        .reduce((sum, item) => sum + item.count, 0),
      completedDeliveries:
        statusCounts.find((s) => s._id === "Delivered")?.count || 0,
      failedDeliveries:
        statusCounts.find((s) => s._id === "Failed")?.count || 0,
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
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const updateAssignedAgent = async (parcelId: string, agentId: string) => {
  try {
    // Find the parcel
    const parcel = await ParcelModel.findById(parcelId);
    if (!parcel) {
      return {
        success: false,
        status: 404,
        message: "Parcel not found",
      };
    }

    // Update the assigned agent
    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      parcelId,
      { assignedAgent: agentId },
      { new: true }
    )
      .populate("customer", "name email")
      .populate("assignedAgent", "name email");

    // Return updated parcel data
    const parcelResponse = {
      id: updatedParcel!._id,
      trackingId: updatedParcel!.trackingId,
      customer: updatedParcel!.customer,
      senderInfo: updatedParcel!.senderInfo,
      receiverInfo: updatedParcel!.receiverInfo,
      parcelDetails: updatedParcel!.parcelDetails,
      payment: updatedParcel!.payment,
      pickupSchedule: updatedParcel!.pickupSchedule,
      status: updatedParcel!.status,
      assignedAgent: updatedParcel!.assignedAgent,
    };

    return {
      success: true,
      status: 200,
      data: {
        parcel: parcelResponse,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

const deleteParcel = async (parcelId: string) => {
  try {
    // Find and delete the parcel
    const parcel = await ParcelModel.findByIdAndDelete(parcelId);
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
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: error.message,
    };
  }
};

export const ParcelServices = {
  bookParcel,
  getAllBookings,
  getCustomerBookings,
  updateAssignedAgent,
  deleteParcel,
};
