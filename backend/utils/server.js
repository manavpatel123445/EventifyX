import app from "./app.js";
import { startEventScheduler } from "./eventScheduler.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start the event scheduler for automatic status updates and cleanup
  startEventScheduler();
});
