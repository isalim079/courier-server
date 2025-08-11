import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { USER_ROLES } from "../auth/auth.interface";

const router = Router();

router.post(
  "/bookAParcel",
  authMiddleware,
  roleMiddleware(USER_ROLES.CUSTOMER),
  ParcelController.bookParcel
);

router.get(
  "/all-bookings",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  ParcelController.getAllBookings
);

router.get(
  "/my-bookings",
  authMiddleware,
  roleMiddleware(USER_ROLES.CUSTOMER),
  ParcelController.getMyBookings
);

router.put(
  "/assign-agent/:parcelId",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  ParcelController.updateAssignedAgent
);

router.delete(
  "/delete/:parcelId",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  ParcelController.deleteParcel
);

router.put(
  "/update-status/:parcelId",
  authMiddleware,
  roleMiddleware(USER_ROLES.AGENT),
  ParcelController.updateParcelStatus
);

router.get(
  "/agent-dashboard",
  authMiddleware,
  roleMiddleware(USER_ROLES.AGENT),
  ParcelController.getAgentDashboard
);

router.get(
  "/track/:trackingId",
  ParcelController.trackParcel
);

export const ParcelRoutes = router;
