import { Request, Response } from "express";
import { AuthServices } from "./auth.services";
import config from "../../config";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const registerUser = async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  // Handle error responses
  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  // Set secure cookie for successful registration
  if (result.data) {
    res.cookie("token", result.data.token, {
      httpOnly: true,
      secure: config.node_environment === "development" ? false : true,
      sameSite: config.node_environment === "development" ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  res.status(result.status).json({
    success: true,
    message: "User registered successfully",
    data: result.data,
  });
};

const loginUser = async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  // Handle error responses
  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  // Set secure cookie for successful login
  if (result.data) {
    res.cookie("token", result.data.token, {
      httpOnly: true,
      secure: config.node_environment === "development" ? false : true,
      sameSite: config.node_environment === "development" ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  res.status(result.status).json({
    success: true,
    message: "Login successful",
    data: result.data,
  });
};

const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const result = await AuthServices.getMe(userId);

  // Handle error responses
  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  res.status(result.status).json({
    success: true,
    message: "User data retrieved successfully",
    data: result.data,
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const result = await AuthServices.logoutUser();

  // Clear the authentication cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.node_environment === "production",
    sameSite: "strict",
  });

  res.status(result.status).json({
    success: true,
    message: result.message,
  });
};

const getAllUsers = async (req: Request, res: Response) => {
  const result = await AuthServices.getAllUsers();

  // Handle error responses
  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  res.status(result.status).json({
    success: true,
    message: "All users retrieved successfully",
    data: result.data,
  });
};

export const AuthController = { registerUser, loginUser, getMe, logoutUser, getAllUsers };
