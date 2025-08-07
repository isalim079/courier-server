import jwt from "jsonwebtoken";
import { IUserDocument } from "../modules/auth/auth.model";
import config from "../config";

export const generateToken = (user: IUserDocument) => {
  if (!config.jwt_secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwt_secret,
    { expiresIn: "7d" }
  );
};
