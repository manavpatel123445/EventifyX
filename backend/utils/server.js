import app from "./app.js";
import { startEventScheduler } from "./eventScheduler.js";
import { connectDB } from "../db.js";

// Use the PORT environment variable set by Render.com, default to 3000 for local development
const PORT = process.env.PORT || 3000;

// Add graceful shutdown handling for production
const gracefulShutdown = (signal) => {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Initialize database and start server
const startServer = async () => {
  // Start listening immediately to satisfy Render's health checks and prevent 502s
  const server = app.listen(PORT, () => {
    console.log(`🚀 EventifyX Backend Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check available at /health`);
    
    // Start the event scheduler
    startEventScheduler();
  });

  // Connect to database in the background
  connectDB().catch(error => {
    console.error("❌ MongoDB Connection Error during startup:", error.message);
    console.warn("⚠️ The server is running but database-dependent features will fail.");
  });
  
  return server;
};

const server = startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
