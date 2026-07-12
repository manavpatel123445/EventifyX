# Backend Development Rules

## Goal
Build a production-ready, scalable, secure, and maintainable backend following modern Node.js and Express best practices.

---

# Project Structure

```
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── helpers/
│   ├── constants/
│   ├── jobs/
│   ├── sockets/
│   ├── events/
│   ├── database/
│   ├── docs/
│   └── app.js
│
├── server.js
├── package.json
└── .env
```

---

# General Rules

- Never write business logic inside routes.
- Routes should only map endpoints.
- Controllers should only handle request and response.
- Services should contain business logic.
- Repository layer handles database operations.
- Models contain schema definitions only.

### Data Flow Pattern
```
Route ──> Controller ──> Service ──> Repository ──> MongoDB
```

---

# Layer Specific Rules

### Controller Rules
- Validate request existence.
- Call service.
- Return standardized response.
- **Never** access MongoDB directly.
- **Never** write business logic.

> **Correct:** Controller ──> Service  
> **Incorrect:** Controller ──> MongoDB

### Service Rules
- Contains business logic, validation, permission checks, external APIs, and transactions.
- **Never** send response, access `req`/`res`, or use Express objects directly.

### Repository Rules
- Handles CRUD operations, aggregation, pagination, and query optimization.
- **Never** write business logic, perform authentication, or format HTTP responses here.

### Model Rules
- Contains only Schema, Indexes, Virtuals, Static methods, and Instance methods.
- **No** business logic.

### Routes Rules
- Define endpoints.
- Apply middleware.
- Call controller.
- *Example:* `GET /users` ──> `UserController.getUsers` (nothing else).

---

# Validation Rules
Always validate incoming `body`, `params`, and `query` parameters. Never trust client-side inputs.
- Use libraries like **Zod**, **Joi**, or **express-validator**.
- Reject invalid data immediately.

---

# Authentication & Authorization
- **Auth Scheme**: Use JWT with short-lived access tokens and refresh tokens. Use Secure Cookies where applicable.
- **Passwords**: Encrypt passwords using `bcrypt` with a minimum of 12 salt rounds. Never store plain text passwords or return password hashes in API responses.
- **Authorization**: Implement Role-Based Access Control (RBAC). Example flow:  
  `Admin` ──> `Manager` ──> `User` ──> `Guest`  
  Ensure all private routes are fully protected.

---

# Error Handling & Logging

### Error Handling
- **Never** handle errors locally with simple try-catch response blocks (e.g. `res.send(error)`).
- Use centralized error middleware.
- Standard response body structure on failure:
  ```json
  {
      "success": false,
      "message": "Error description",
      "errors": []
  }
  ```

### Logging
- Use standard production logging tools like **Winston** or **Pino**.
- **Log**: Requests, system errors, database queries/failures, and external API requests/failures.
- **Do NOT Log**: Passwords, tokens, credit card details, or OTPs.

---

# Response Formatting

All APIs must return standardized JSON payloads:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {}
}
```

### Failure Response (4xx / 5xx)
```json
{
  "success": false,
  "message": "Error descriptive message",
  "errors": []
}
```

---

# Environment Variables
Everything configurable belongs in `.env`. Never hardcode secrets.
```properties
PORT=
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
REDIS_URL=
```

---

# Database Best Practices
- **Always**: Create Indexes, use `.lean()` for read-only operations, utilize projection (to hide fields like password/IP), paginate large queries, and limit results.
- **Never** run unbounded queries like `Model.find()` without a limit.

---

# API Design & Conventions
- Adhere to REST conventions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Use plural nouns for resource paths:
  - **Good**: `/users`, `/products`, `/orders`
  - **Bad**: `/getUsers`, `/createOrder`
- **Versioning**: Always prefix APIs with a version indicator, e.g. `/api/v1/`.

### Pagination & Filtering
- All list endpoints must support query parameters:
  - `?page=1&limit=20&sort=createdAt&order=desc`
- Support standard filters: `search`, `status`, `date`, `category`, `price`, `role`.

---

# Security
- Always implement **Helmet**, **Rate Limiting**, **CORS**, **Input Validation**, **XSS Protection**, and **Mongo Sanitization**.
- **Never expose** stack traces, raw secrets, or internal paths in production response payloads.

---

# File Uploads
- Always validate file **size**, **MIME type**, and **extension**.
- Store files in external object storage (**Cloudinary** or **AWS S3**). Never store large binary files in MongoDB.
- Never trust the client-provided upload filename.

---

# Emails
- Always use predefined email templates.
- Queue emails to a background system (e.g. BullMQ/Redis) so they do not block API execution.
- Implement retry mechanisms for email dispatch failures.

---

# Performance Optimization
- Utilize **Redis caching** for hot read paths.
- Ensure efficient database indexing.
- Use gzip/brotli compression.
- Run async tasks concurrently where possible and delegate heavy processes to background workers.
- Avoid N+1 query patterns and duplicate DB hits.

---

# Code Style & Naming Conventions

### Naming Conventions
- **Files**: `[name].[layer].js` (e.g. `user.controller.js`, `user.service.js`)
- **Variables / Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_CASE`

### Middleware Execution Order
```
Request ──> Helmet ──> CORS ──> Compression ──> Logger ──> Rate Limit ──> Authentication ──> Authorization ──> Validation ──> Controller ──> Error Handler
```

### HTTP Status Codes
- `200 OK` / `201 Created` / `204 No Content`
- `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found`
- `409 Conflict` / `422 Validation Error` / `429 Too Many Requests`
- `500 Internal Server Error`

---

# Quality & Verification

### Documentation
Every endpoint must document: Method, URL, Authentication required, Request Body schema, Query Parameters, and both Success and Error responses (OpenAPI / Swagger preferred).

### Testing
Write Unit, Integration, and End-to-End API tests. Maintain a minimum target of **80% code coverage**.

---

# Golden Rules
1. Never trust user input.
2. Never expose sensitive information.
3. Keep controllers thin.
4. Keep services reusable.
5. Repositories only handle database access.
6. Write modular, composable, and testable code.
7. Every API must be secure.
8. Every response must be standardized.
9. Optimize before deploying.
