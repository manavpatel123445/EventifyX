# EventifyX API Documentation

## 🚀 Role-Based Event Management System

### **System Overview**
EventifyX uses a 3-role system with dynamic role promotion:
- **User**: Can create event requests
- **Event Manager**: Manages approved events (promoted from User after approval)  
- **Admin**: Approves requests and manages the system

### **Workflow**
1. **User** creates event request → Status: "pending"
2. **Admin** reviews and approves → Creates event, **User** becomes **Event Manager**
3. **Event Manager** can now manage their approved events
4. **Public** can view and book approved events

---

## 📋 API Endpoints

### 🌐 **PUBLIC ENDPOINTS (No Authentication)**

#### Events
```http
GET /api/events
```
Get all public events with filtering and search
- Query params: `category`, `city`, `date`, `search`, `page`, `limit`, `sortBy`, `sortOrder`

```http
GET /api/events/:identifier
```
Get single event by ID or slug

---

### 🔐 **USER ENDPOINTS (Authentication Required)**

#### Event Requests
```http
POST /api/events/request
```
Submit event request for admin approval
```json
{
  "title": "Music Concert 2024",
  "description": "Amazing live concert...",
  "category": "categoryId",
  "date": "2024-12-31",
  "startTime": "19:00",
  "endTime": "23:00",
  "venue": {
    "name": "City Arena",
    "address": "123 Main St",
    "city": "New York",
    "capacity": 5000
  },
  "ticketPricing": [
    {
      "type": "regular",
      "price": 50,
      "quantity": 1000
    }
  ],
  "images": ["https://example.com/image.jpg"]
}
```

```http
GET /api/events/my-requests
```
Get user's event requests with status filtering

---

### 🎭 **EVENT MANAGER ENDPOINTS (event_manager role)**

#### Manage Events
```http
GET /api/events/managed
```
Get events managed by current user with statistics

```http
PUT /api/events/:eventId
```
Update event details (only own events)
```json
{
  "title": "Updated Event Title",
  "description": "Updated description...",
  "venue": {
    "name": "Updated Venue"
  },
  "images": ["new-image.jpg"]
}
```

```http
PATCH /api/events/:eventId/cancel
```
Cancel event (only upcoming events)
```json
{
  "reason": "Unavoidable circumstances"
}
```

```http
GET /api/events/:eventId/stats
```
Get detailed event statistics (tickets, revenue, occupancy)

---

### 👑 **ADMIN ENDPOINTS (admin role)**

#### Event Request Management
```http
GET /api/events/admin/requests
```
Get all event requests for review

```http
POST /api/events/admin/requests/:requestId/approve
```
Approve event request (promotes user to event_manager)
```json
{
  "adminNotes": "Event approved successfully"
}
```

```http
POST /api/events/admin/requests/:requestId/reject
```
Reject event request
```json
{
  "adminNotes": "Does not meet community guidelines"
}
```

#### Dashboard & Analytics
```http
GET /api/admin/dashboard
```
Get comprehensive dashboard statistics

```http
GET /api/admin/analytics
```
Get advanced analytics with date filtering

#### User Management
```http
GET /api/admin/users
```
Get all users with filtering and search

```http
GET /api/admin/users/:userId
```
Get detailed user information

```http
PATCH /api/admin/users/:userId/status
```
Block/unblock user
```json
{
  "status": "blocked" // or "active"
}
```

```http
PATCH /api/admin/users/:userId/role
```
Update user role
```json
{
  "role": "event_manager" // or "user", "admin"
}
```

```http
DELETE /api/admin/users/:userId
```
Soft delete user account

#### Category Management
```http
GET /api/admin/categories
```
Get all categories

```http
POST /api/admin/categories
```
Create new category
```json
{
  "name": "Music Events",
  "description": "Concerts and music festivals",
  "color": "#FF5733",
  "icon": "music"
}
```

```http
PUT /api/admin/categories/:categoryId
```
Update category

```http
DELETE /api/admin/categories/:categoryId
```
Delete category (if no events/requests use it)

---

## 🔑 **Authentication**

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### **Role Permissions**
- **User**: Can create event requests and view their own requests
- **Event Manager**: All User permissions + manage approved events + view stats
- **Admin**: All permissions + approve/reject requests + user management + analytics

---

## 📊 **Data Models**

### Event Request (Pending Approval)
```json
{
  "_id": "requestId",
  "title": "Event Title",
  "description": "Event description",
  "category": "categoryId",
  "date": "2024-12-31",
  "startTime": "19:00",
  "endTime": "23:00",
  "venue": {
    "name": "Venue Name",
    "address": "Address",
    "city": "City",
    "capacity": 1000
  },
  "ticketPricing": [
    {
      "type": "regular",
      "price": 50,
      "quantity": 100,
      "sold": 0
    }
  ],
  "requestedBy": "userId",
  "status": "pending", // "approved", "rejected"
  "adminNotes": "",
  "reviewedBy": "adminId",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Event (Approved)
```json
{
  "_id": "eventId",
  "title": "Event Title",
  "description": "Event description",
  "category": "categoryId",
  "eventManager": "userId",
  "status": "upcoming", // "ongoing", "completed", "cancelled"
  "totalBookings": 0,
  "totalRevenue": 0,
  "approvedBy": "adminId",
  "originalRequest": "requestId",
  "slug": "event-title-2024",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### User with Dynamic Roles
```json
{
  "_id": "userId",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user", // "event_manager", "admin"
  "status": "active", // "blocked"
  "managedEvents": ["eventId1", "eventId2"],
  "becameManagerAt": "2024-01-01T00:00:00Z"
}
```

---

## 🧪 **Testing the System**

### 1. Create Event Request (as User)
```bash
curl -X POST http://localhost:3001/api/events/request \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Concert",
    "description": "Great music event",
    "category": "categoryId",
    "date": "2024-12-31",
    "startTime": "20:00",
    "endTime": "23:00",
    "venue": {
      "name": "Concert Hall",
      "address": "123 Music St",
      "city": "New York",
      "capacity": 500
    },
    "ticketPricing": [
      {
        "type": "regular",
        "price": 75,
        "quantity": 400
      }
    ]
  }'
```

### 2. Approve Request (as Admin)
```bash
curl -X POST http://localhost:3001/api/events/admin/requests/<requestId>/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adminNotes": "Excellent event proposal!"
  }'
```

### 3. Manage Event (as Event Manager)
```bash
curl -X PUT http://localhost:3001/api/events/<eventId> \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated event description"
  }'
```

---

## ⚠️ **Important Features**

1. **Dynamic Role Promotion**: Users automatically become Event Managers when their first event is approved
2. **Ownership Control**: Event Managers can only edit their own events
3. **Status Validation**: Can't edit completed/cancelled events
4. **Comprehensive Filtering**: Search by category, city, date, keywords
5. **Real-time Statistics**: Track bookings, revenue, occupancy
6. **Admin Oversight**: Complete user and event management capabilities

This system provides complete CRUD operations without any hardcoded data, everything is dynamic and role-based!
