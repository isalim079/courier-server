import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get("/getMe", authMiddleware, AuthController.getMe);
router.post("/logout", AuthController.logoutUser);

export const AuthRoutes = router;