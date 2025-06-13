# HerWay - Server

HerWay is a backend API for a women-driven cab service platform, focused on safety and convenience. This documentation covers the **User Authentication Routes**.

---

## User Authentication Routes

All user authentication routes are prefixed with `/api/v1/auth/user`.

### **Register User**
- **Endpoint:** `POST /api/v1/auth/user/register`
- **Description:** Register a new user (passenger or driver).
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "countryCode": "string",
    "phoneNumber": "string",
    "gender": "male|female|other",
    "password": "string",
    "isVerified": "boolean"
  }
  ```
- **Response:**  
  - `201 Created`  
  - Returns user data and sets an `auth_token` cookie.

---

### **Login with OTP**
- **Endpoint:** `POST /api/v1/auth/user/login`
- **Description:** Login using phone number and OTP.
- **Request Body:**
  ```json
  {
    "phoneNumber": "string",
    "otp": "string"
  }
  ```
- **Response:**  
  - `200 OK`  
  - Returns user data, JWT token, and sets an `auth_token` cookie.

---

### **Logout**
- **Endpoint:** `GET /api/v1/auth/user/logout`
- **Description:** Logout the current user. Requires authentication.
- **Headers:**  
  - `Authorization: Bearer <token>`
- **Response:**  
  - `200 OK`  
  - Clears the `auth_token` cookie.

---

### **Send OTP**
- **Endpoint:** `POST /api/v1/auth/user/send-otp`
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
- **Endpoint:** `POST /api/v1/auth/user/verify-otp`
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

## Error Handling

All errors return a JSON response with a status code and message.

---

## Example Usage

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","countryCode":"+91","phoneNumber":"9876543210","gender":"female","password":"password123","isVerified":false}'
```

**Send OTP:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/user/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210"}'
```

---

## Notes

- All protected routes require a valid JWT token in the `Authorization` header or as an `auth_token` cookie.
- OTPs are stored in Redis in development and verified via Twilio in production.

---

For more details, see the source code