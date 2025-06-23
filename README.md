# Yaatrika API Documentation

Yaatrika is a backend API for a women-driven cab service platform, focused on safety, convenience, and real-time features. This documentation covers all implemented modules and routes in the `src` folder.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Implemented Modules](#implemented-modules)
- [API Routes](#api-routes)
  - [Authentication](#authentication)
  - [Ride Booking](#ride-booking)
  - [Maps](#maps)
  - [Admin](#admin)
- [Models](#models)
- [Error Handling](#error-handling)
- [Sample API Usage](#sample-api-usage)
- [Environment Variables](#environment-variables)
- [Notes](#notes)
- [Source Code Reference](#source-code-reference)

---

## Project Overview

Yaatrika provides a secure authentication system for both users (passengers) and captains (drivers), OTP-based login, JWT-based session management, ride booking, fare calculation, and Google Maps integration. OTPs are handled via Redis in development and Twilio in production.

---

## Implemented Modules

### 1. User & Captain Management
- Registration (user/captain)
- Login with OTP
- Logout (JWT blacklist via Redis)
- Token verification

### 2. OTP Management
- OTP generation and storage (Redis)
- OTP verification (Redis/Twilio)
- OTP sending (Twilio SMS in production)

### 3. Ride Management
- Ride creation (booking)
- Ride model and status tracking

### 4. Fare Management
- Fare calculation based on vehicle type, distance, and duration
- Admin can set fare rates

### 5. Maps Integration
- Get coordinates from address
- Get time and distance between locations
- Autocomplete suggestions for locations

### 6. Payment Management
- Payment model for rides (Razorpay/cash supported)

### 7. Middleware & Utilities
- JWT authentication and blacklist check (`isLoggedIn`)
- Structured API responses
- Centralized error handling
- Logging (Winston + Morgan)

---

## API Routes

### Authentication

All authentication routes are prefixed with `/api/v1/auth`.

| Method | Endpoint                      | Description                       | Auth Required |
|--------|-------------------------------|-----------------------------------|--------------|
| POST   | `/user/register`              | Register a new user (passenger)   | No           |
| POST   | `/captain/register`           | Register a new captain (driver)   | No           |
| POST   | `/login`                      | Login using phone and OTP         | No           |
| GET    | `/logout`                     | Logout current user/captain       | Yes          |
| POST   | `/send-otp`                   | Send OTP to phone number          | No           |
| POST   | `/verify-otp`                 | Verify OTP                        | No           |

#### Token Verification

| Method | Endpoint                | Description                       | Auth Required |
|--------|-------------------------|-----------------------------------|--------------|
| GET    | `/api/v1/verify-token`  | Verify JWT and return user info   | Yes          |

---

### Ride Booking

All ride routes are prefixed with `/api/v1/ride`.

| Method | Endpoint      | Description         | Auth Required |
|--------|--------------|---------------------|--------------|
| POST   | `/create`    | Book a new ride     | Yes          |

---

### Maps

All map routes are prefixed with `/api/v1/map`.

| Method | Endpoint             | Description                        | Auth Required |
|--------|----------------------|------------------------------------|--------------|
| POST   | `/get-coordinates`   | Get coordinates from address       | Yes          |
| POST   | `/get-time-distance` | Get time and distance for a route  | Yes          |
| GET    | `/get-suggestions`   | Get autocomplete suggestions       | Yes          |

---

### Admin

All admin routes are prefixed with `/api/v1/admin`.

| Method | Endpoint      | Description           | Auth Required |
|--------|--------------|-----------------------|--------------|
| POST   | `/set-fare`  | Set fare rates        | Yes          |

---

## Models

### User Model (`src/models/user.model.ts`)
- `firstName`: string
- `lastName`: string
- `email`: string (unique)
- `countryCode`: string
- `phoneNumber`: number (unique)
- `gender`: 'male' | 'female' | 'other'
- `isKycDone`: boolean
- `isVerified`: boolean
- `socketId`: string | null

### Captain Model (`src/models/captain.model.ts`)
- Same as User, plus:
  - `vehicalColor`, `vehicalCapacity`, `vehicalType`, `vehicalPlate`, `status`, `location`

### Ride Model (`src/models/ride.model.ts`)
- `user`: ObjectId (User)
- `captain`: ObjectId (Captain)
- `pickup`: string
- `destination`: string
- `fare`: number
- `status`: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
- `vehicleType`: 'sedan' | 'bike' | 'auto' | 'suv'
- `duration`: number (seconds)
- `distance`: number (meters)
- `paymentId`: ObjectId (Payment)
- `orderId`: string
- `signature`: string
- `otp`: number

### Payment Model (`src/models/payment.model.ts`)
- `ride`: ObjectId (Ride)
- `method`: 'razorpay' | 'cash'
- `status`: 'pending' | 'paid' | 'failed' | 'refunded'
- `amount`: number
- `currency`: string
- `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`: string (optional)
- `captured`: boolean
- `email`, `contact`, `description`: string

### Fare Model (`src/models/fare.model.ts`)
- `vehicleType`: 'bike' | 'auto' | 'sedan' | 'suv'
- `baseFare`: number
- `perKmRate`: number
- `perMinRate`: number
- `minFare`: number
- `surgeMultiplier`: number
- `updatedBy`: ObjectId (User)

---

## Error Handling

All errors return a JSON response with a status code and message.  
Centralized error handler: [`src/middlewares/errorHandler.ts`](src/middlewares/errorHandler.ts)

---

## Sample API Usage

**Register User:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","countryCode":"+91","phoneNumber":"9876543210","gender":"female","isVerified":false}'
```

**Send OTP:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210"}'
```

**Book Ride:**
```bash
curl -X POST http://localhost:8080/api/v1/ride/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleType":"sedan","origin":"Address A","destination":"Address B"}'
```

---

## Environment Variables

| Variable             | Description                        |
|----------------------|------------------------------------|
| `PORT`               | Server port                        |
| `MONGODB_URI`        | MongoDB connection string          |
| `JWT_SECRET`         | Secret key for JWT                 |
| `CORS_ORIGIN`        | Allowed CORS origins               |
| `REDIS_HOST`         | Redis host                         |
| `REDIS_PORT`         | Redis port                         |
| `REDIS_PASSWORD`     | Redis password                     |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (prod only)     |
| `TWILIO_AUTH_TOKEN`  | Twilio Auth Token (prod only)      |
| `TWILIO_VERIFY_SID`  | Twilio Verify SID (prod only)      |
| `OTP_SECRET`         | Secret for OTP hashing             |
| `GOOGLE_MAPS_API_KEY`| Google Maps API Key                |

---

## Notes

- All protected routes require a valid JWT token in the `Authorization` header or as an `auth_token` cookie.
- OTPs are stored in Redis in development and verified via Twilio in production.
- Token blacklist is managed via Redis for secure logout.
- Fare calculation and maps integration use Google Maps API.

---

## Source Code Reference

- [User Auth Routes](src/routes/auth.route.ts)
- [Ride Routes](src/routes/ride.route.ts)
- [Map Routes](src/routes/map.routes.ts)
- [Admin Routes](src/routes/admin.route.ts)
- [User Controller](src/controllers/auth/userAuth.controller.ts)
- [Captain Controller](src/controllers/auth/captainAuth.controller.ts)
- [Ride Controller](src/controllers/ride/ride.controller.ts)
- [Maps Controller](src/controllers/maps/maps.controller.ts)
- [Fare Controller](src/controllers/admin/fare/fare.controller.ts)
- [User Model](src/models/user.model.ts)
- [Captain Model](src/models/captain.model.ts)
- [Ride Model](src/models/ride.model.ts)
- [Payment Model](src/models/payment.model.ts)
- [Fare Model](src/models/fare.model.ts)
- [isLoggedIn Middleware](src/middlewares/isLoggedIn.ts)
- [Error Handler Middleware](src/middlewares/errorHandler.ts)

---

_Work completed: User and captain registration, OTP-based login, logout, token verification, ride booking, fare calculation, Google Maps integration, payment model, admin fare management, and all related error handling and utilities._