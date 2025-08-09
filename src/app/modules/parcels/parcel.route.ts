import { Router } from "express";
import { ParcelController } from "./parcel.controller";

const router = Router();

router.post("/bookAParcel", ParcelController.bookParcel);

export const ParcelRoutes = router;
