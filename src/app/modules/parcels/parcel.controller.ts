import { Request, Response } from "express";
import { ParcelServices } from "./parcel.service";

const bookParcel = async (req: Request, res: Response) => {
  const result = await ParcelServices.bookParcel(req.body);

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

export const ParcelController = { bookParcel };
