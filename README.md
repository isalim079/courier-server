# Courier Server - Real-time Parcel Tracking System

A comprehensive courier service backend with real-time location tracking using Node.js, Express, MongoDB, and Socket.IO.

## Features

- 🔐 **JWT Authentication** with HTTP cookie-based sessions
- 👥 **Role-based Access Control** (Admin, Customer, Agent)
- 📦 **Parcel Management** with Google Geocoding API integration
- 📍 **Real-time Location Tracking** using Socket.IO
- 📊 **Dashboard Analytics** for all user types
- 🗺️ **Live Agent Tracking** for customers

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO for live location tracking
- **External APIs**: Google Geocoding API
- **Development**: Nodemon, ts-node

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd courier-server
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with:
DATABASE_URL=mongodb://localhost:27017/courier-db
JWT_SECRET=your-jwt-secret
BCRYPT_SALT_ROUNDS=12
GOOGLE_MAP_API_KEY=your-google-api-key
NODE_ENVIRONMENT=development
PORT=5000
```

4. Start the development server
```bash
npm run start:dev
```

## API Endpoints

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /getMe` - Get current user profile
- `POST /logout` - User logout
- `GET /all-users` - Get all users (Admin only)
- `DELETE /delete-user/:userId` - Delete user (Admin only)

### Parcel Routes (`/api/v1/parcel`)
- `POST /bookAParcel` - Book a new parcel (Customer only)
- `GET /all-bookings` - Get all bookings (Admin only)
- `GET /my-bookings` - Get customer's bookings (Customer only)
- `PUT /assign-agent/:parcelId` - Assign agent to parcel (Admin only)
- `DELETE /delete/:parcelId` - Delete parcel (Admin only)
- `PUT /update-status/:parcelId` - Update parcel status (Agent only)
- `GET /agent-dashboard` - Get agent dashboard data (Agent only)
- `GET /track/:trackingId` - Track parcel (Public route)

---

## Socket.IO Real-time Location Tracking

### Features Implemented:

1. **Real-time Agent Location Updates**
2. **Parcel Tracking with Live Location**
3. **Socket Rooms for Each Tracking ID**
4. **Authentication for Socket Connections**
5. **Status Updates via Socket**

### Frontend Integration Guide

#### 1. Install Socket.IO Client
```bash
npm install socket.io-client
```

#### 2. Agent Dashboard Integration

```javascript
// Agent Dashboard Component
import { io } from 'socket.io-client';

const AgentDashboard = () => {
  const [socket, setSocket] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token') // or get from cookies
      }
    });

    setSocket(newSocket);

    // Start watching geolocation
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setLocation(newLocation);
          
          // Send location to backend
          newSocket.emit('agent_location_update', newLocation);
        },
        (error) => console.error('Geolocation error:', error),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        newSocket.disconnect();
      };
    }
  }, []);

  return (
    <div>
      <h2>Agent Dashboard</h2>
      {location && (
        <p>Current Location: {location.lat}, {location.lng}</p>
      )}
      {/* Your dashboard components */}
    </div>
  );
};
```

#### 3. Customer Tracking Integration

```javascript
// Customer Tracking Component
import { io } from 'socket.io-client';

const TrackParcel = ({ trackingId }) => {
  const [socket, setSocket] = useState(null);
  const [parcelData, setParcelData] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);

  useEffect(() => {
    // Initialize socket connection (no auth needed for tracking)
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Start tracking the parcel
    newSocket.emit('track_parcel', { trackingId });

    // Listen for parcel data
    newSocket.on('parcel_data', (data) => {
      setParcelData(data);
      setAgentLocation(data.agentLocation);
    });

    // Listen for real-time agent location updates
    newSocket.on('agent_location', (data) => {
      if (data.trackingId === trackingId) {
        setAgentLocation(data.agentLocation);
      }
    });

    // Listen for status updates
    newSocket.on('status_update', (data) => {
      if (data.trackingId === trackingId) {
        setParcelData(prev => ({
          ...prev,
          status: data.status
        }));
      }
    });

    return () => {
      newSocket.emit('stop_tracking', { trackingId });
      newSocket.disconnect();
    };
  }, [trackingId]);

  return (
    <div>
      <h2>Track Parcel: {trackingId}</h2>
      
      {parcelData && (
        <div>
          <p>Status: {parcelData.status}</p>
          <p>Agent: {parcelData.assignedAgent?.name}</p>
          
          {agentLocation && (
            <div>
              <h3>Live Agent Location:</h3>
              <p>Lat: {agentLocation.lat}</p>
              <p>Lng: {agentLocation.lng}</p>
              
              {/* Integrate with Google Maps */}
              <div id="map" style={{height: '400px', width: '100%'}}>
                {/* Google Maps component showing agent location */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 4. Socket Events Reference

##### Agent Events:
- **Emit**: `agent_location_update` - Send current location
- **Listen**: `location_updated` - Confirmation of location update
- **Listen**: `error` - Error messages

##### Customer Tracking Events:
- **Emit**: `track_parcel` - Start tracking a parcel
- **Emit**: `stop_tracking` - Stop tracking a parcel
- **Listen**: `parcel_data` - Initial parcel information
- **Listen**: `agent_location` - Real-time agent location updates
- **Listen**: `status_update` - Parcel status changes
- **Listen**: `tracking_error` - Tracking errors

## Database Schema

### User Schema
```typescript
{
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: "admin" | "customer" | "agent";
  timestamps: true;
}
```

### Parcel Schema
```typescript
{
  trackingId: string; // Auto-generated unique ID
  customer: ObjectId; // Reference to User
  senderInfo: TAddress;
  receiverInfo: TAddress; // Includes geocoded location
  parcelDetails: TParcelDetails;
  payment: TPayment;
  pickupSchedule: Date;
  status: "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Failed";
  assignedAgent?: ObjectId; // Reference to User
  agentLocation?: TLocation; // Real-time agent GPS coordinates
  timestamps: true;
}
```

## How Real-time Tracking Works:

1. **Agent logs in** → Socket connects with authentication
2. **Agent's location is tracked** → Sent to backend every few seconds
3. **Backend updates** all parcels assigned to that agent
4. **Customer tracks parcel** → Joins specific tracking room
5. **Real-time updates** → Customer receives live agent location
6. **Status changes** → Broadcast to all tracking that parcel

## Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

## Error Handling

The system includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

## Development

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT License

---

**Built with ❤️ for efficient courier service management**
