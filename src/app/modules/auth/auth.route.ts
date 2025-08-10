import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { USER_ROLES } from "./auth.interface";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get("/getMe", authMiddleware, AuthController.getMe);
router.post("/logout", AuthController.logoutUser);
router.get(
  "/all-users",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  AuthController.getAllUsers
);

router.delete(
  "/delete-user/:userId",
  authMiddleware,
  roleMiddleware(USER_ROLES.ADMIN),
  AuthController.deleteUser
);

export const AuthRoutes = router;
