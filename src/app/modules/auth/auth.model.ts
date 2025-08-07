import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { TUser } from "./auth.interface";
import config from "../../config";

export interface IUserDocument extends TUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "agent"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const UserModel = model<IUserDocument>("User", userSchema);
