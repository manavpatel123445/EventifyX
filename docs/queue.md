# Queue Documentation

Background workers are powered by **BullMQ** running on top of **Redis**.

## Active Queues

### `email-queue`
- **Purpose**: Processes verification emails, order confirmation slips, and ticket receipt notifications.
- **Payload**: `{ to: string, subject: string, body: string }`
- **Worker File**: [emailWorker.js](file:///f:/all%20the%20folder/EventifyX-main/backend/src/workers/emailWorker.js)
