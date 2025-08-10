import { Request, Response } from "express";
import { ParcelServices } from "./parcel.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const bookParcel = async (req: AuthenticatedRequest, res: Response) => {
  // Add customer ID from authenticated user to the request data
  const parcelData = {
    ...req.body,
    customerId: req.user!.id
  };
  
  const result = await ParcelServices.bookParcel(parcelData);

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
};

const getAllBookings = async (req: Request, res: Response) => {
  const result = await ParcelServices.getAllBookings();

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
};

const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  const customerId = req.user!.id;
  const result = await ParcelServices.getCustomerBookings(customerId);

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
};

const updateAssignedAgent = async (req: Request, res: Response) => {
  const { parcelId } = req.params;
  const { agentId } = req.body;

  // Validate required fields
  if (!agentId) {
    return res.status(400).json({
      success: false,
      message: "Agent ID is required",
    });
  }

  const result = await ParcelServices.updateAssignedAgent(parcelId, agentId);

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
};

const deleteParcel = async (req: Request, res: Response) => {
  const { parcelId } = req.params;

  const result = await ParcelServices.deleteParcel(parcelId);

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
};

export const ParcelController = { 
  bookParcel, 
  getAllBookings, 
  getMyBookings,
  updateAssignedAgent,
  deleteParcel
};
