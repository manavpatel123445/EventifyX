import app from "./app.js";
import connectDB from "./database/db.js";
import ensureIndexes from "./database/indexes.js";
import config from "./config/environment.js";

const PORT = config.port;

const startServer = async () => {
  // Bootstrap DB Connection
  try {
    await connectDB();
    // Build/verify indexes on startup for production performance
    await ensureIndexes();
  } catch (err) {
    console.error("❌ MongoDB startup error:", err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 EventifyX Backend Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${config.env}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`🛑 Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startServer();

// Global Exception Handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
export default app;
