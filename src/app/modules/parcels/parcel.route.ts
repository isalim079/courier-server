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

export const ParcelRoutes = router;
