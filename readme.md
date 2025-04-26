# Yaatrika - Cab Service Application

Yaatrika is a cab service application driven by women for women. It includes features like real-time tracking using `socket.io`, emergency contact management, trip booking, and more.

---

## **Modules Implemented**

### **1. User Management**
- **Features**:
  - User registration (passenger/driver).
  - User login/logout.
  - OTP-based email/phone verification.
- **Files**:
  - `src\models\user.model.ts`
  - `src\controllers\user.controller.ts`
  - `src\routes\user.route.ts`

---

### **2. Emergency Contact Management**
- **Features**:
  - Add emergency contacts for passengers.
  - Retrieve emergency contacts.
- **Files**:
  - `src\models\emergencyContact.model.ts`
  - `src\controllers\emergencyContact.controller.ts`

---

### **3. Trip Management**
- **Features**:
  - Book a trip.
  - Update trip status (ongoing, completed, cancelled).
- **Files**:
  - `src\models\trip.model.ts`
  - `src\controllers\trip.controller.ts`

---

### **4. Driver Management**
- **Features**:
  - Driver registration.
  - Driver availability status (available/unavailable).
- **Files**:
  - `src\models\driver.model.ts`

---

### **5. Vehicle Management**
- **Features**:
  - Manage driver vehicles (plate number, model, color, type).
- **Files**:
  - `src\models\vehicle.model.ts`

---

### **6. Payment Management**
- **Features**:
  - Payment methods for passengers.
  - Payment details for trips.
- **Files**:
  - `src\models\paymentMode.model.ts`
  - `src\models\payment.model.ts`

---

### **7. Review Management**
- **Features**:
  - Add reviews for trips (rating, comments).
- **Files**:
  - `src\models\review.model.ts`

---

### **8. OTP Management**
- **Features**:
  - Generate and send OTP for email/phone verification.
  - Verify OTP.
- **Files**:
  - `src\models\otp.model.ts`
  - `src\utils\otpHelper.ts`

---

### **9. Real-Time Tracking**
- **Features**:
  - Track passenger location using `socket.io`.
  - Broadcast location to emergency contacts.
- **Files**:
  - `src\index.ts`

---

### **10. Utilities**
- **Features**:
  - Error handling.
  - API response formatting.
  - Email sending.
- **Files**:
  - `src\middlewares\errorHandler.ts`
  - `src\utils\apiResponse.ts`
  - `src\utils\sendEmail.ts`

---

## **Routes**

### **User Routes**
| Method | Endpoint                     | Description                     | Middleware   |
|--------|------------------------------|---------------------------------|--------------|
| POST   | `/user/auth/client/register` | Register a passenger.           | None         |
| POST   | `/user/auth/driver/register` | Register a driver.              | None         |
| POST   | `/user/auth/client/login`    | Login a user.                   | None         |
| POST   | `/user/auth/logout`          | Logout a user.                  | `isLoggedIn` |
| POST   | `/user/auth/emergency-contacts` | Add an emergency contact.     | `isLoggedIn` |
| GET    | `/user/auth/emergency-contacts` | Get emergency contacts.       | `isLoggedIn` |

---

### **Trip Routes**
| Method | Endpoint         | Description              | Middleware   |
|--------|------------------|--------------------------|--------------|
| POST   | `/user/auth/trips` | Book a trip.           | `isLoggedIn` |
| PATCH  | `/user/auth/trips/status` | Update trip status. | `isLoggedIn` |

---

## **Models**

### **User Model**
| Field       | Type     | Description                     |
|-------------|----------|---------------------------------|
| `name`      | String   | User's name.                   |
| `email`     | String   | User's email (unique).         |
| `phone`     | String   | User's phone number.           |
| `password`  | String   | User's hashed password.        |
| `userType`  | Enum     | `passenger` or `driver`.       |
| `rating`    | Number   | User's rating.                |
| `isVerified`| Boolean  | Whether the user is verified. |

---

### **Emergency Contact Model**
| Field         | Type     | Description                     |
|---------------|----------|---------------------------------|
| `passengerId` | ObjectId | Reference to the passenger.    |
| `name`        | String   | Contact's name.                |
| `phone`       | String   | Contact's phone number.        |

---

### **Trip Model**
| Field          | Type     | Description                     |
|----------------|----------|---------------------------------|
| `driverId`     | ObjectId | Reference to the driver.       |
| `passengerId`  | ObjectId | Reference to the passenger.    |
| `startLocation`| String   | Trip start location.           |
| `endLocation`  | String   | Trip end location.             |
| `tripDateTime` | Date     | Date and time of the trip.     |
| `status`       | Enum     | `ongoing`, `completed`, `cancelled`. |
| `fare`         | Number   | Trip fare.                     |

---

## **Utilities**

### **Error Handling**
- File: `src\middlewares\errorHandler.ts`
- Handles API errors and sends structured error responses.

### **API Response**
- File: `src\utils\apiResponse.ts`
- Formats API responses with status, data, and message.

### **Email Sending**
- File: `src\utils\sendEmail.ts`
- Sends OTP emails using `nodemailer`.

---

## **Real-Time Tracking**
- **Socket Events**:
  - `trackLocation`: Emits passenger location to emergency contacts.
  - `location:<passengerId>`: Listens for location updates.

---

## **Environment Variables**
| Variable         | Description                     |
|------------------|---------------------------------|
| `PORT`           | Server port.                   |
| `MONGODB_URI`    | MongoDB connection string.     |
| `JWT_SECRET`     | Secret key for JWT.            |
| `EMAIL_SECRET`   | Email address for sending OTPs.|
| `EMAIL_PASS`     | Password for the email account.|
| `CORS_ORIGIN`    | Allowed CORS origins.          |

---

This documentation provides a complete overview of the project, including implemented modules, routes, models, and utilities. Let us know if you need further assistance!