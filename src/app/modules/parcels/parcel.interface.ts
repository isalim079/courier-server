export type TLocation = {
  lat: number;
  lng: number;
};

export type TAddress = {
  name: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  location?: TLocation;
};

export type TParcelDetails = {
  type: "small" | "medium" | "large";
  weight: number;
  description: string;
  specialInstructions?: string;
};

export type TPayment = {
  method: "COD";
  codAmount: number;
};

export type TParcel = {
  trackingId: string;
  customer: string; // Customer who booked the parcel
  senderInfo: TAddress;
  receiverInfo: TAddress;
  parcelDetails: TParcelDetails;
  payment: TPayment;
  pickupSchedule: Date;
  status: "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Failed";
  assignedAgent?: string | null;
};
