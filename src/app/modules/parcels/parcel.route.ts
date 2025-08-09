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

export const ParcelRoutes = router;
