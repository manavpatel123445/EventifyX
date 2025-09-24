# 📊 Import Sample Data for EventifyX

## **Quick Sample Data Import:**

### **1. Create Collections:**
```javascript
// Users Collection
{
  "name": "Admin User",
  "email": "admin@eventifyx.com",
  "password": "hashed_password_here",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z"
}

// Events Collection
{
  "title": "Sample Tech Event",
  "description": "A sample technology event",
  "date": "2024-06-15T10:00:00Z",
  "location": "Tech Hub",
  "price": 25,
  "category": "Technology",
  "maxAttendees": 100,
  "organizer": "EventifyX Team"
}

// Categories Collection
{
  "name": "Technology",
  "description": "Tech events and conferences"
}
```

### **2. Import Steps:**
1. Open Compass
2. Connect to Atlas
3. Create collection
4. Add Data → Insert Document
5. Paste JSON data
6. Click Insert

### **3. Sample Import Command:**
```bash
mongoimport --uri="YOUR_CONNECTION_STRING" --collection=users --file=sample_users.json --jsonArray
```

**Need detailed import guide? Check `IMPORT_DATA_GUIDE.md`**
