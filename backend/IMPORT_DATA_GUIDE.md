# 📥 Import Data into MongoDB Compass (Atlas)

## 🎯 **How to Import Tables/Data into Your MongoDB Database**

## **Method 1: Import from JSON/CSV Files**

### **Step 1: Prepare Your Data**
1. **Format your data** as JSON or CSV
2. **JSON format example:**
   ```json
   [
     {
       "name": "Event 1",
       "description": "Description here",
       "date": "2024-01-01",
       "location": "Venue A"
     },
     {
       "name": "Event 2",
       "description": "Another event",
       "date": "2024-01-02",
       "location": "Venue B"
     }
   ]
   ```

### **Step 2: Import into Compass**
1. **Open MongoDB Compass**
2. **Connect to your Atlas database**
3. **Navigate to your database** (EventifyX)
4. **Click "Create Collection"** or select existing collection
5. **Click "Add Data"** → **"Import File"**
6. **Choose your file** (JSON, CSV, etc.)
7. **Map fields** if needed (for CSV)
8. **Click "Import"**

## **Method 2: Import from MongoDB Export**

### **Export from Local MongoDB:**
1. **Use mongoexport** command:
   ```bash
   mongoexport --db=your_local_db --collection=events --out=events.json
   ```

### **Import to Atlas:**
1. **Open Compass** → Connect to Atlas
2. **Go to your database**
3. **Click "Add Data"** → **"Import File"**
4. **Select your exported JSON file**
5. **Click "Import"**

## **Method 3: Create Collections Manually**

### **Step 1: Create Collection**
1. **In Compass, select your database**
2. **Click "Create Collection"**
3. **Enter collection name** (e.g., `events`, `users`, `categories`)
4. **Click "Create"**

### **Step 2: Add Documents**
1. **Click "Add Data"** → **"Insert Document"**
2. **Enter JSON data:**
   ```json
   {
     "name": "Sample Event",
     "description": "This is a sample event",
     "date": "2024-01-01T10:00:00Z",
     "location": "Sample Venue",
     "price": 25,
     "category": "Technology"
   }
   ```
3. **Click "Insert"**

## **Method 4: Import Sample EventifyX Data**

### **For EventifyX Backend:**
1. **Create collections:**
   - `users`
   - `events`
   - `categories`
   - `bookings`
   - `managers`

2. **Import sample data** for testing:
   ```json
   // Users collection
   {
     "name": "John Doe",
     "email": "john@example.com",
     "role": "user",
     "createdAt": "2024-01-01T00:00:00Z"
   }

   // Events collection
   {
     "title": "Tech Conference 2024",
     "description": "Annual technology conference",
     "date": "2024-06-15T09:00:00Z",
     "location": "Convention Center",
     "price": 50,
     "category": "Technology",
     "organizer": "Tech Events Inc"
   }
   ```

## **Method 5: Import from SQL Database**

### **If you have SQL data:**
1. **Export SQL to CSV** from your SQL database
2. **Convert CSV to JSON** (use online converters or scripts)
3. **Import JSON into Compass** using Method 1

## **Method 6: Use mongoimport Command Line**

### **For large datasets:**
```bash
# Import JSON file
mongoimport --uri="mongodb+srv://username:password@cluster.mongodb.net/EventifyX" --collection=events --file=events.json --jsonArray

# Import CSV file
mongoimport --uri="mongodb+srv://username:password@cluster.mongodb.net/EventifyX" --collection=events --type=csv --file=events.csv --headerline
```

## 🎯 **Quick Import Summary:**

1. **Prepare your data** (JSON/CSV format)
2. **Open Compass** → Connect to Atlas
3. **Select database** → Click "Add Data"
4. **Choose "Import File"**
5. **Select your file** and import
6. **Verify data** appears in collection

## 📋 **Supported Import Formats:**

- ✅ **JSON** (recommended)
- ✅ **CSV** (with field mapping)
- ✅ **TSV** (tab-separated)
- ✅ **MongoDB Extended JSON**
- ✅ **BSON files**

## 🚀 **Best Practices:**

- **Start small** - test with a few records first
- **Backup first** - export existing data before importing
- **Use JSON** - most reliable format for MongoDB
- **Check field mapping** - ensure CSV headers match
- **Validate data** - check imported documents look correct

**Your EventifyX database will be populated and ready to use!** 🎉
