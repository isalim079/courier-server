import { ParcelModel } from "./parcel.model";

// Generate unique tracking ID
const generateTrackingId = (): string => {
  const prefix = "trkId";
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
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

    // Create new parcel
    const parcel = await ParcelModel.create({
      trackingId,
      senderInfo: parcelData.senderInfo,
      receiverInfo: parcelData.receiverInfo,
      parcelDetails: parcelData.parcelDetails,
      payment: parcelData.payment,
      pickupSchedule,
      status: "Pending",
    });

    // Return parcel data
    const parcelResponse = {
      id: parcel._id,
      trackingId: parcel.trackingId,
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

export const ParcelServices = { bookParcel };
