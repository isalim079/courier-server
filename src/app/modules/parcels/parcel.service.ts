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
    const geocodingResult = await getCoordinatesFromAddress(parcelData.receiverInfo);
    
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
      senderInfo: parcelData.senderInfo,
      receiverInfo: receiverInfoWithLocation,
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
