# Courier Server - Real-time Parcel Tracking System

A comprehensive courier service backend with real-time location tracking using Node.js, Express, MongoDB, and Socket.IO. This backend powers a complete courier management platform with agent location tracking, parcel management, and real-time customer tracking capabilities.

## 🚀 Features

- 🔐 **JWT Authentication** with HTTP cookie-based sessions
- 👥 **Role-based Access Control** (Admin, Customer, Agent)
- 📦 **Comprehensive Parcel Management** with auto-generated tracking IDs
- 📍 **Real-time Agent Location Tracking** using Socket.IO
- 🗺️ **Google Maps Integration** with automatic address geocoding
- 📊 **Dashboard Analytics** for all user types
- 🏠 **Socket Rooms** for isolated tracking sessions
- 🔄 **Live Status Updates** broadcast to customers
- 📱 **Mobile-Friendly** location tracking for agents

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO for live location tracking
- **External APIs**: Google Geocoding API for address validation
- **Development**: ts-node-dev, morgan logging
- **Security**: CORS, cookie-parser, HTTP-only cookies

## 📁 Project Structure

```
courier-server/
├── src/
│   ├── app/
│   │   ├── config/          # Environment configuration
│   │   ├── middlewares/     # Auth & role middlewares
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication module
│   │   │   └── parcels/     # Parcel management module
│   │   ├── socket/          # Socket.IO implementation
│   │   └── utils/           # Utility functions
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── .env.example            # Environment variables template
├── package.json
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or cloud instance)
- Google Maps API key
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/isalim079/courier-server.git
cd courier-server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
MONGODB_URL=mongodb://localhost:27017/courier-db
PORT=3003
NODE_ENVIRONMENT=development
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_SALT_ROUNDS=12
GOOGLE_MAP_API_KEY=your-google-maps-api-key
```

4. **Start the development server**
```bash
npm run start:dev
```

5. **Verify installation**
- Server should be running on `http://localhost:3003`
- Socket.IO server should be initialized
- Check console for "App running on 3003 🚀" and "Socket.IO server initialized 📡"

### Frontend Integration
This backend is designed to work with the React frontend:
**Frontend Repository**: [https://github.com/isalim079/courier-frontend](https://github.com/isalim079/courier-frontend)

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017/courier-db` |
| `PORT` | Server port number | `3003` |
| `NODE_ENVIRONMENT` | Environment mode | `development` or `production` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-long-random-secret-key` |
| `BCRYPT_SALT_ROUNDS` | BCrypt hashing rounds | `12` |
| `GOOGLE_MAP_API_KEY` | Google Maps Geocoding API key | `AIzaSyBxxxxxxx...` |

## ⚙️ CORS Configuration

The application has **two CORS configurations** that need to be updated based on your deployment:

### 1. Express Server CORS (`src/app.ts`)
```typescript
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
```

### 2. Socket.IO CORS (`src/app/socket/socket.ts`)
```typescript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});
```

### 🔄 Update for Your Environment

**For Development:**
- Current settings work with React dev servers on ports 5173, 5174
- Update ports if your frontend runs on different ports

**For Production:**
```typescript
// Update both files with your production URLs
origin: [
  "https://your-frontend-domain.com",
  "https://your-admin-panel.com"
],
```

**For Multiple Environments:**
```typescript
// Use environment-based configuration
origin: process.env.NODE_ENVIRONMENT === 'production' 
  ? ["https://your-production-domain.com"]
  : ["http://localhost:5173", "http://localhost:5174"],
```

> **⚠️ Important**: Both CORS configurations must match for proper frontend integration. Update both `app.ts` and `socket.ts` when changing allowed origins.

## 📚 API Documentation

### Base URL
```
http://localhost:3003/api/v1
```

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/register` | User registration | ❌ | - |
| POST | `/login` | User login | ❌ | - |
| GET | `/getMe` | Get current user profile | ✅ | Any |
| POST | `/logout` | User logout | ❌ | - |
| GET | `/all-users` | Get all users | ✅ | Admin |
| DELETE | `/delete-user/:userId` | Delete user | ✅ | Admin |

### Parcel Routes (`/parcel`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/bookAParcel` | Book a new parcel | ✅ | Customer |
| GET | `/all-bookings` | Get all bookings | ✅ | Admin |
| GET | `/my-bookings` | Get customer's bookings | ✅ | Customer |
| PUT | `/assign-agent/:parcelId` | Assign agent to parcel | ✅ | Admin |
| DELETE | `/delete/:parcelId` | Delete parcel | ✅ | Admin |
| PUT | `/update-status/:parcelId` | Update parcel status | ✅ | Agent |
| GET | `/agent-dashboard` | Get agent dashboard data | ✅ | Agent |
| GET | `/track/:trackingId` | Track parcel | ❌ | Public |

### Sample API Requests

#### Register User
```bash
curl -X POST http://localhost:3003/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

#### Book a Parcel
```bash
curl -X POST http://localhost:3003/api/v1/parcel/bookAParcel \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your-jwt-token" \
  -d '{
    "senderInfo": {
      "name": "John Doe",
      "phone": "+1234567890",
      "address1": "123 Main St",
      "city": "New York",
      "postalCode": "10001"
    },
    "receiverInfo": {
      "name": "Jane Smith",
      "phone": "+0987654321",
      "address1": "456 Oak Ave",
      "city": "Los Angeles",
      "postalCode": "90210"
    },
    "parcelDetails": {
      "type": "medium",
      "weight": "2kg",
      "description": "Electronics"
    },
    "payment": {
      "method": "COD",
      "codAmount": 150
    },
    "pickupSchedule": "2025-08-15T10:00:00Z"
  }'
```

## 🔌 Socket.IO Real-time Features

### Connection Setup

The Socket.IO server uses **HTTP cookie-based authentication** for secure connections:

```javascript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});
```

### Real-time Events

#### 🚚 Agent Events
| Event | Direction | Data Format | Description |
|-------|-----------|-------------|-------------|
| `agent_location_update` | Client → Server | `{lat: number, lng: number}` | Agent sends location |
| `location_updated` | Server → Client | `{message: string, location: object}` | Confirmation |
| `error` | Server → Client | `{message: string}` | Error notification |

#### 📦 Customer Tracking Events
| Event | Direction | Data Format | Description |
|-------|-----------|-------------|-------------|
| `track_parcel` | Client → Server | `{trackingId: string}` | Start tracking |
| `stop_tracking` | Client → Server | `{trackingId: string}` | Stop tracking |
| `parcel_data` | Server → Client | `ParcelData` | Initial parcel info |
| `agent_location` | Server → Client | `{trackingId, agentLocation, status}` | Live location |
| `status_update` | Server → Client | `{trackingId, status, timestamp}` | Status change |

#### 🔧 Agent Status Events
| Event | Direction | Data Format | Description |
|-------|-----------|-------------|-------------|
| `update_parcel_status` | Client → Server | `{parcelId: string, status: string}` | Update status |
| `status_updated` | Server → Client | `{message, parcelId, status}` | Confirmation |

### Frontend Integration Examples

#### Agent Location Tracking
```javascript
import { io } from 'socket.io-client';

// Initialize with cookie authentication
const socket = io('http://localhost:3003', {
  withCredentials: true, // Important for cookie auth
});

// Track agent location
navigator.geolocation.watchPosition((position) => {
  const location = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  
  socket.emit('agent_location_update', location);
});

// Handle confirmation
socket.on('location_updated', (data) => {
  console.log('Location saved:', data.message);
});
```

#### Customer Tracking
```javascript
const socket = io('http://localhost:3003');

// Start tracking a parcel
socket.emit('track_parcel', { trackingId: 'trkId123456' });

// Listen for initial data
socket.on('parcel_data', (parcel) => {
  console.log('Parcel info:', parcel);
  // Display parcel details
});

// Listen for real-time location updates
socket.on('agent_location', (update) => {
  console.log('Agent location:', update.agentLocation);
  // Update map with new agent position
});

// Listen for status changes
socket.on('status_update', (update) => {
  console.log('Status changed to:', update.status);
  // Update UI with new status
});
```

### Room-based Architecture

The system uses Socket.IO rooms for efficient broadcasting:

- **Agent Rooms**: `agent_{userId}` - For agent-specific notifications
- **Tracking Rooms**: `tracking_{trackingId}` - For parcel-specific updates

This ensures customers only receive updates for parcels they're tracking, and agents only receive relevant notifications.

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

## 🗄️ Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,        // Unique, lowercase
  password: string,     // BCrypt hashed
  role: "admin" | "customer" | "agent",
  createdAt: Date,
  updatedAt: Date
}
```

### Parcel Collection
```typescript
{
  _id: ObjectId,
  trackingId: string,           // Auto-generated unique ID
  customer: ObjectId,           // Reference to User
  senderInfo: {
    name: string,
    phone: string,
    address1: string,
    address2?: string,
    city: string,
    postalCode: string
  },
  receiverInfo: {
    name: string,
    phone: string,
    address1: string,
    address2?: string,
    city: string,
    postalCode: string,
    location: {                 // Auto-geocoded from address
      lat: number,
      lng: number
    }
  },
  parcelDetails: {
    type: "small" | "medium" | "large",
    weight: string,
    description: string,
    specialInstructions?: string
  },
  payment: {
    method: "COD",              // Currently only COD supported
    codAmount: number
  },
  pickupSchedule: Date,
  status: "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Failed",
  assignedAgent?: ObjectId,     // Reference to User (agent)
  agentLocation?: {             // Real-time agent GPS coordinates
    lat: number,
    lng: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
- `trackingId`: Unique index for fast tracking queries
- `customer`: Index for customer-specific queries
- `assignedAgent`: Index for agent dashboard queries
- `status`: Index for status-based filtering

## 🚀 System Architecture

### Real-time Flow Diagram
```
1. Agent Login → Socket Authentication → Join Agent Room
2. Agent Location → Socket Event → Database Update → Broadcast to Tracking Rooms
3. Customer Track → Join Tracking Room → Receive Real-time Updates
4. Status Change → Database Update → Broadcast to Tracking Room
```

### Key Components

1. **Authentication Layer**
   - JWT token generation and validation
   - HTTP-only cookie management
   - Role-based access control

2. **Socket.IO Layer**
   - Cookie-based authentication for sockets
   - Room management for isolated tracking
   - Real-time event broadcasting

3. **Database Layer**
   - MongoDB with Mongoose ODM
   - Automatic tracking ID generation
   - Geocoding integration for addresses

4. **External Integrations**
   - Google Geocoding API for address validation
   - Real-time location tracking via browser APIs

## 📊 API Response Format

All API endpoints return responses in this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Sample Responses

#### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f123abc456def789012345",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Track Parcel Response
```json
{
  "success": true,
  "message": "Parcel tracking data retrieved successfully",
  "data": {
    "parcel": {
      "trackingId": "trkId1691234567890ABC123",
      "status": "In Transit",
      "assignedAgent": {
        "name": "Agent Smith",
        "email": "agent@courier.com"
      },
      "agentLocation": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "senderInfo": { /* ... */ },
      "receiverInfo": { /* ... */ }
    }
  }
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload

# Production
npm run build             # Build TypeScript to JavaScript
npm start                 # Start production server (after build)

# Utilities
npm test                  # Run tests (if configured)
```

### Development Workflow

1. **Setup development environment**
   ```bash
   git clone https://github.com/isalim079/courier-server.git
   cd courier-server
   npm install
   cp .env.example .env     # Configure environment variables
   ```

2. **Configure CORS for your frontend**
   ```bash
   # Update CORS origins in both files:
   # - src/app.ts (Express CORS)
   # - src/app/socket/socket.ts (Socket.IO CORS)
   # Change from localhost:5173,5174 to your frontend URLs
   ```

3. **Start development**
   ```bash
   npm run start:dev
   ```

3. **Test API endpoints**
   - Use Postman, Thunder Client, or curl
   - Import the provided API examples
   - Test Socket.IO with the frontend

### Project Dependencies

#### Runtime Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **socket.io**: Real-time communication
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **cors**: Cross-origin resource sharing
- **cookie-parser**: HTTP cookie parsing
- **dotenv**: Environment variable management
- **morgan**: HTTP request logging

#### Development Dependencies
- **typescript**: Type checking
- **ts-node-dev**: Development server with hot reload
- **@types/***: TypeScript definitions

### Environment Setup

#### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name courier-mongo mongo:latest
```

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Geocoding API
3. Create API key
4. Add to `.env` file

### Testing

#### Manual Testing
```bash
# Test user registration
curl -X POST http://localhost:3003/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'

# Test Socket.IO connection
# Use browser console or Socket.IO client library
```

#### Production Deployment

```bash
# Build the application
npm run build

# Update CORS settings for production
# Edit src/app.ts and src/app/socket/socket.ts
# Replace localhost URLs with production domains

# Set production environment variables
export NODE_ENVIRONMENT=production
export MONGODB_URL=your_production_db_url

# Start production server
npm start
```

### ⚠️ Pre-deployment Checklist

- [ ] Update CORS origins in both `app.ts` and `socket.ts`
- [ ] Set production environment variables
- [ ] Configure production MongoDB connection
- [ ] Update Google Maps API key restrictions
- [ ] Test Socket.IO connections with production URLs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use TypeScript for type safety
- Follow existing naming conventions
- Add proper error handling
- Document API changes
- Test Socket.IO events thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **Frontend Repository**: [courier-frontend](https://github.com/isalim079/courier-frontend)
- **Live Demo**: Coming soon

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue on GitHub.

## 🙏 Acknowledgments

- Socket.IO team for real-time communication capabilities
- Google Maps team for geocoding services
- MongoDB team for the excellent database solution
- Express.js community for the robust web framework

---

**Built with ❤️ for efficient courier service management**

### 🎯 Key Features Implemented

✅ **Real-time Location Tracking**  
✅ **JWT Authentication with HTTP Cookies**  
✅ **Role-based Access Control**  
✅ **Google Maps Integration**  
✅ **Socket.IO Room Management**  
✅ **Comprehensive API Documentation**  
✅ **TypeScript Support**  
✅ **Production Ready**  

---

*Last updated: August 2025*
