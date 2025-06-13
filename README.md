# HerWay - Server

HerWay is a backend API for a women-driven cab service platform, focused on safety and convenience. This documentation covers the **User Authentication Routes** and related backend modules implemented so far.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Implemented Modules](#implemented-modules)
- [User Authentication Routes](#user-authentication-routes)
- [Models](#models)
- [Error Handling](#error-handling)
- [Sample API Usage](#sample-api-usage)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

---

## Project Overview

HerWay provides a secure authentication system for both users (passengers) and captains (drivers), OTP-based login, JWT-based session management, and token verification. OTPs are handled via Redis in development and Twilio in production.

---

## Implemented Modules

### 1. User Management
- User registration (passenger)
- Captain registration (driver)
- Login with OTP
- Logout (JWT blacklist via Redis)
- Token verification

### 2. OTP Management
- OTP generation and storage (Redis)
- OTP verification (Redis/Twilio)
- OTP sending (Twilio SMS in production)

### 3. Middleware
- `isLoggedIn`: JWT authentication and blacklist check

### 4. Utilities
- Structured API responses
- Centralized error handling
- Logging (Winston + Morgan)

---

## User Authentication Routes

All user authentication routes are prefixed with `/api/v1/auth`.

### **Register User**
- **Endpoint:** `POST /api/v1/auth/user/register`
- **Description:** Register a new user (passenger).
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "countryCode": "string",
    "phoneNumber": "string",
    "gender": "male|female|other",
    "isVerified": "boolean"
  }
  ```
- **Response:**  
  - `201 Created`  
  - Returns user data and sets an `auth_token` cookie.

---

### **Register Captain**
- **Endpoint:** `POST /api/v1/auth/captain/register`
- **Description:** Register a new captain (driver).
- **Request Body:** Same as user registration.
- **Response:**  
  - `201 Created`  
  - Returns captain data and sets an `auth_token` cookie.

---

### **Login with OTP**
- **Endpoint:** `POST /api/v1/auth/login`
- **Description:** Login using phone number and OTP.
- **Request Body:**
  ```json
  {
    "phoneNumber": "string",
    "otp": "string",
    "role": "user" // or "captain" (optional, defaults to "user")
  }
  ```
- **Response:**  
  - `200 OK`  
  - Returns user/captain data, JWT token, and sets an `auth_token` cookie.

---

### **Logout**
- **Endpoint:** `GET /api/v1/auth/logout`
- **Description:** Logout the current user. Requires authentication.
- **Headers:**  
  - `Authorization: Bearer <token>`
- **Response:**  
  - `200 OK`  
  - Clears the `auth_token` cookie and blacklists the token.

---

### **Send OTP**
- **Endpoint:** `POST /api/v1/auth/send-otp`
- **Description:** Send an OTP to the user's phone number.
- **Request Body:**
  ```json
  {
    "phoneNumber": "string"
  }
  ```
- **Response:**  
  - `201 Created`  
  - In development: returns the OTP in the response.  
  - In production: sends OTP via SMS.

---

### **Verify OTP**
- **Endpoint:** `POST /api/v1/auth/verify-otp`
- **Description:** Verify the OTP sent to the user's phone number.
- **Request Body:**
  ```json
  {
    "phoneNumber": "string",
    "otp": "string"
  }
  ```
- **Response:**  
  - `200 OK`  
  - Returns `true` if OTP is valid and not already registered.

---

### **Verify Token**
- **Endpoint:** `GET /verify-token`
- **Description:** Verify the JWT token and return user details. Requires authentication.
- **Headers:**  
  - `Authorization: Bearer <token>`
- **Response:**  
  - `200 OK`  
  - Returns user data if token is valid.

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

---

## Notes

- All protected routes require a valid JWT token in the `Authorization` header or as an `auth_token` cookie.
- OTPs are stored in Redis in development and verified via Twilio in production.
- Token blacklist is managed via Redis for secure logout.

---

## Source Code Reference

- [User Auth Routes](src/routes/user.auth.route.ts)
- [User Controller](src/controllers/auth/userAuth.controller.ts)
- [Captain Controller](src/controllers/auth/captainAuth.controller.ts)
- [User Model](src/models/user.model.ts)
- [Captain Model](src/models/captain.model.ts)
- [isLoggedIn Middleware](src/middlewares/isLoggedIn.ts)

---

_Work completed: User and captain registration, OTP-based login, logout, token verification, and all related error handling and utilities.