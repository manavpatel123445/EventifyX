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
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 EventifyX Backend Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check available at http://localhost:${PORT}`);

      // Start the event scheduler for automatic status updates and cleanup
      startEventScheduler();
    });
    
    return server;
  } catch (error) {
    console.error("❌ Critical Failure: Could not connect to database.");
    console.error("The server will not start until the database is available.");
    // We don't call process.exit(1) here if we want to allow nodemon to retry on file changes,
    // but in a production environment, this would typically cause the container to restart.
  }
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
