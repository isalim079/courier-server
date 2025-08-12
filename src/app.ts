import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { ParcelRoutes } from "./app/modules/parcels/parcel.route";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://courier-frontend-alpha.vercel.app", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/parcel", ParcelRoutes);

app.get("/", (req, res) => {
  res.send(`Courier api is live... 🚀`);
});

export default app;
