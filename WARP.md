# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Yaatrika is a TypeScript/Node.js backend API for a women-driven cab service platform focused on safety and real-time features. The codebase implements a complete ride-hailing system with authentication, OTP verification, ride booking, fare calculation, Google Maps integration, and payment processing.

## Development Commands

### Setup and Running
```bash
# Install dependencies (uses bun lockfile)
bun install

# Start development server with hot reload
bun run dev

# Build TypeScript to JavaScript
bun run build

# Run built application (after build)
node dist/index.js
```

### Development Workflow
```bash
# The dev command uses nodemon with ts-node/esm loader
# Watches src/ directory and auto-restarts on changes
# Command: node --no-warnings --loader ts-node/esm ./src/index.ts

# Format code with Prettier
npx prettier --write .

# Check TypeScript compilation without emitting files
npx tsc --noEmit
```

## Architecture Overview

### Core Application Structure
- **Entry Points**: `src/index.ts` (server startup) → `src/app.ts` (Express app configuration)
- **Database**: MongoDB via Mongoose + Redis for caching/session management
- **Authentication**: JWT-based with Redis blacklist for logout functionality
- **Module System**: ES modules (type: "module" in package.json)

### Key Architectural Patterns

#### Service Layer Architecture
The codebase follows a clean architecture pattern with clear separation:
- **Controllers**: Handle HTTP requests/responses (business logic orchestration)
- **Services**: Core business logic and external API integrations
- **Models**: Mongoose schemas and database interactions
- **Middlewares**: Cross-cutting concerns (auth, error handling, logging)
- **Utils**: Shared utilities and response formatting

#### Authentication Flow
- Dual user types: Users (passengers) and Captains (drivers)
- OTP-based login via Redis (dev) or Twilio (production)
- JWT tokens with Redis-based blacklist for secure logout
- Middleware `isLoggedIn` handles authentication and role detection

#### Key Service Dependencies
- **Redis**: OTP storage, token blacklist, session management
- **MongoDB**: Primary data persistence
- **Google Maps API**: Geocoding, distance calculation, autocomplete
- **Twilio**: SMS OTP delivery (production)
- **Cloudinary**: Image upload handling

### Critical File Relationships

#### Authentication Chain
1. `routes/auth.route.ts` → `controllers/auth/*.controller.ts`
2. `middlewares/isLoggedIn.ts` → `services/redisService.ts`
3. `services/otpService/` handles OTP generation/verification

#### Ride Booking Flow
1. `routes/ride.route.ts` → `controllers/ride/ride.controller.ts`
2. `services/mapService/map.service.ts` for distance/time calculation
3. `services/fareService/fare.service.ts` for pricing
4. Models: `user.model.ts`, `captain.model.ts`, `ride.model.ts`, `payment.model.ts`

## Environment Configuration

### Required Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis configuration
- `GOOGLE_MAPS_API_KEY`: For maps services
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`: SMS (production)
- `CORS_ORIGIN`: Allowed origins for CORS
- `PORT`: Server port (default 8080)

## API Structure

### Route Organization
- `/api/v1/auth/`: User/Captain registration, login, OTP operations
- `/api/v1/ride/`: Ride booking and management
- `/api/v1/map/`: Google Maps integration (coordinates, distance, suggestions)
- `/api/v1/admin/`: Administrative functions (fare management)
- `/api/vi/cloudinary/`: Image upload services (note: typo in route)

### Authentication Requirements
Most endpoints require JWT authentication via:
- `Authorization: Bearer <token>` header OR
- `auth_token` cookie

Token verification endpoint: `GET /api/v1/verify-token`

## Key Development Considerations

### TypeScript Configuration
- Uses modern ES modules (`"type": "module"`)
- Target: ESNext with Node.js resolution
- Custom types in `src/types/` for strong typing
- Extended Express Request interface (`IRequest`) for authenticated routes

### Error Handling Strategy
- Centralized error handler in `middlewares/errorHandler.ts`
- Custom `ApiError` class for consistent error responses
- `asyncHandler` wrapper for controller error catching
- Structured API responses via `apiResponse` utility

### Database Models
Key entities with relationships:
- **User/Captain**: Authentication and profile data
- **Ride**: Links user, captain, with pickup/destination, fare, status
- **Payment**: Razorpay/cash payment tracking
- **Fare**: Configurable pricing by vehicle type

### Redis Usage Patterns
- OTP storage: `otp:${phoneNumber}`
- Token blacklist: `blacklistedToken:${token}`
- Session management and caching

## Testing and Quality

The codebase currently lacks test infrastructure. When adding tests:
- Consider Jest with TypeScript support
- Test Redis integration with redis-memory-server
- Mock external APIs (Google Maps, Twilio)
- Test authentication flows end-to-end

## Common Development Tasks

### Adding New Routes
1. Create route file in `src/routes/`
2. Create controller in appropriate `src/controllers/` subdirectory
3. Add route to `src/app.ts`
4. Update types if needed in `src/types/`

### Database Schema Changes
1. Update model in `src/models/`
2. Update TypeScript interface in `src/types/`
3. Consider migration strategy for existing data

### External Service Integration
1. Add service in `src/services/`
2. Add environment variables
3. Update error handling for service failures
4. Add appropriate logging