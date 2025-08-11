import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { ParcelModel } from "../modules/parcels/parcel.model";
import { UserModel } from "../modules/auth/auth.model";
import jwt from "jsonwebtoken";
import config from "../config";
import * as cookie from "cookie";

interface AuthenticatedSocket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  // Authentication middleware for socket (HTTP Cookie based)
  io.use(async (socket: any, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token in cookies"));
      }

      const decoded = jwt.verify(token, config.jwt_secret as string) as {
        id: string;
      };
      const user = await UserModel.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = (user._id as any).toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error(`Authentication error: ${error}`));
    }
  });

  io.on("connection", (socket: any) => {
    // Agent joins their personal room for receiving assignments
    if (socket.userRole === "agent") {
      socket.join(`agent_${socket.userId}`);
    }

    // Handle disconnection
    socket.on("disconnect", (reason: string) => {
      // Connection cleanup handled automatically
    });

    // Handle agent location updates
    socket.on(
      "agent_location_update",
      async (data: { lat: number; lng: number }) => {
        try {
          if (socket.userRole !== "agent") {
            socket.emit("error", {
              message: "Only agents can update location",
            });
            return;
          }
          const { lat, lng } = data;

          // Update agent location in all assigned parcels
          const updateResult = await ParcelModel.updateMany(
            { assignedAgent: socket.userId },
            {
              $set: {
                agentLocation: { lat, lng },
              },
            }
          );

          // Get all parcels assigned to this agent
          const parcels = await ParcelModel.find({
            assignedAgent: socket.userId,
          });

          // Emit location update to all tracking rooms
          parcels.forEach((parcel) => {
            const roomName = `tracking_${parcel.trackingId}`;
            socket.to(roomName).emit("agent_location", {
              trackingId: parcel.trackingId,
              agentLocation: { lat, lng },
              status: parcel.status,
              timestamp: new Date(),
            });
          });

          socket.emit("location_updated", {
            message: "Location updated successfully",
            location: { lat, lng },
          });
        } catch (error: any) {
          socket.emit("error", { message: "Failed to update location" });
        }
      }
    );

    // Handle customer tracking parcel
    socket.on("track_parcel", async (data: { trackingId: string }) => {
      try {
        const { trackingId } = data;

        // Find the parcel
        const parcel = await ParcelModel.findOne({ trackingId })
          .populate("customer", "name email")
          .populate("assignedAgent", "name email");

        if (!parcel) {
          socket.emit("tracking_error", { message: "Parcel not found" });
          return;
        }

        // Join tracking room
        const roomName = `tracking_${trackingId}`;
        socket.join(roomName);

        // Send initial parcel data
        const parcelData = {
          trackingId: parcel.trackingId,
          status: parcel.status,
          senderInfo: parcel.senderInfo,
          receiverInfo: parcel.receiverInfo,
          parcelDetails: parcel.parcelDetails,
          pickupSchedule: parcel.pickupSchedule,
          assignedAgent: parcel.assignedAgent,
          agentLocation: parcel.agentLocation,
          lastUpdated: (parcel as any).updatedAt,
        };

        socket.emit("parcel_data", parcelData);
      } catch (error: any) {
        socket.emit("tracking_error", { message: "Failed to track parcel" });
      }
    });

    // Handle leaving tracking room
    socket.on("stop_tracking", (data: { trackingId: string }) => {
      const { trackingId } = data;
      const roomName = `tracking_${trackingId}`;
      socket.leave(roomName);
    });

    // Handle status updates from agents
    socket.on(
      "update_parcel_status",
      async (data: { parcelId: string; status: string }) => {
        try {
          if (socket.userRole !== "agent") {
            socket.emit("error", { message: "Only agents can update status" });
            return;
          }

          const { parcelId, status } = data;

          // Find and update parcel
          const parcel = await ParcelModel.findById(parcelId);
          if (!parcel || parcel.assignedAgent?.toString() !== socket.userId) {
            socket.emit("error", {
              message: "Unauthorized or parcel not found",
            });
            return;
          }

          // Update status
          parcel.status = status as any;
          await parcel.save();

          // Notify tracking room about status change
          const roomName = `tracking_${parcel.trackingId}`;
          socket.to(roomName).emit("status_update", {
            trackingId: parcel.trackingId,
            status: status,
            timestamp: new Date(),
          });

          socket.emit("status_updated", {
            message: "Status updated successfully",
            parcelId,
            status,
          });
        } catch (error: any) {
          socket.emit("error", { message: "Failed to update status" });
        }
      }
    );

    socket.on("disconnect", () => {
      // Cleanup on disconnect
    });
  });

  return io;
};
