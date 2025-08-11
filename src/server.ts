import mongoose from "mongoose";
import { createServer } from "http";
import app from "./app";
import config from "./app/config";
import { initializeSocket } from "./app/socket/socket";

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize Socket.IO
    const io = initializeSocket(server);
    
    server.listen(config.port, () => {
      console.log(`App running on ${config.port} 🚀`);
      console.log(`Socket.IO server initialized 📡`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
