# Event View Components

This directory contains components for displaying comprehensive event information for admin and manager views.

## Components

### 1. EventViewModal

A comprehensive modal component that displays all event details in a read-only format.

**Features:**
- Full event information display
- Responsive design
- Status indicators with color coding
- Image gallery
- Detailed ticket pricing and availability
- Event statistics and metrics
- Manager and category information

**Usage:**
```tsx
import { EventViewModal } from '../components';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        View Event Details
      </button>
      
      <EventViewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={selectedEvent}
      />
    </>
  );
};
```

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function to close the modal
- `event: Event | null` - Event data to display

### 2. EventQuickView

A compact component that shows key event details in a condensed format, perfect for lists and tables.

**Features:**
- Condensed event information
- Quick action buttons (View Details, Edit, Delete)
- Image previews
- Key metrics display
- Responsive design

**Usage:**
```tsx
import { EventQuickView } from '../components';

const MyComponent = () => {
  const handleEdit = () => {
    // Handle edit action
  };

  const handleDelete = () => {
    // Handle delete action
  };

  return (
    <EventQuickView
      event={eventData}
      showActions={true}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};
```

**Props:**
- `event: Event` - Event data to display
- `showActions?: boolean` - Whether to show action buttons (default: false)
- `onEdit?: () => void` - Edit action handler
- `onDelete?: () => void` - Delete action handler

### 3. EventViewDemo

A demonstration component that showcases both EventViewModal and EventQuickView components.

**Usage:**
```tsx
import { EventViewDemo } from '../components';

// Use in your app to see the components in action
<EventViewDemo />
```

## Event Data Structure

These components expect an `Event` object with the following structure:

```typescript
interface Event {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  ticketPricing: {
    type: string;
    price: number;
    quantity: number;
    sold: number;
  }[];
  images: string[];
  eventManager: {
    _id: string;
    name: string;
    email: string;
  };
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isPublic: boolean;
  totalBookings: number;
  totalRevenue: number;
  slug: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Styling

The components use Tailwind CSS classes and are fully responsive. They include:
- Hover effects and transitions
- Color-coded status indicators
- Responsive grid layouts
- Consistent spacing and typography

## Integration Examples

### Admin Dashboard
```tsx
// In an admin dashboard, use EventQuickView for event lists
{events.map(event => (
  <EventQuickView
    key={event._id}
    event={event}
    showActions={true}
    onEdit={() => handleEditEvent(event._id)}
    onDelete={() => handleDeleteEvent(event._id)}
  />
))}
```

### Manager Dashboard
```tsx
// In a manager dashboard, show events with quick actions
{managedEvents.map(event => (
  <EventQuickView
    key={event._id}
    event={event}
    showActions={true}
    onEdit={() => openUpdateModal(event)}
    onDelete={() => handleCancelEvent(event._id)}
  />
))}
```

### Event Details View
```tsx
// For detailed event viewing
const [showDetails, setShowDetails] = useState(false);

<EventViewModal
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  event={selectedEvent}
/>
```

## Accessibility

The components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly structure
- High contrast color schemes
- Responsive touch targets

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly interfaces
