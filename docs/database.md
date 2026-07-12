# Database Documentation

## Collection Schema & Indexes

We use MongoDB (via Mongoose) to model data. Indexes are compiled programmatically on startup.

### Users

- **Indexes**:
  - `email` (unique index for quick lookup)
  - `role` (index for role-based lists)
  - `status` (index for state filtering)

### Events

- **Indexes**:
  - `slug` (unique index for URL route mapping)
  - `eventManager` (reference index)
  - `category` (reference index)
  - `isDeleted` (filter flag)
  - `startDate`/`endDate` (date query optimizations)
