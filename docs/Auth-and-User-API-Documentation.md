# Auth & User API Documentation

Base URL: `http://localhost:5000`

---

## Architecture Overview

- **AuthModule (`src/auth/`)**:
  - Handles registration, credentials login, OTP request & verification, token generation (`@nestjs/jwt`), and authentication guard (`JwtAuthGuard`).
  - **No Passport dependency**: Uses direct NestJS `@nestjs/jwt` and a custom `CanActivate` guard.
  - Password hashing uses standard `bcrypt` with salt rounds.
- **UserModule (`src/modules/users/`)**:
  - Dedicated strictly to User entity persistence and data operations.
  - No authentication logic or token generation resides in this module.
  - Minimal user model: `id`, `name`, `email`, `password` (hidden by default), `mobileNumber`, `mobileCountryCode`, `createdAt`, `updatedAt`.

---

## Authentication Endpoints

### 1. Register
`POST /auth/register`

Creates a new user account with hashed password.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobileNumber": "9876543210",
  "mobileCountryCode": "+91"
}
```

**Success Response (`201 Created`)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "mobileCountryCode": "+91",
    "createdAt": "2026-09-09T17:15:00.000Z",
    "updatedAt": "2026-09-09T17:15:00.000Z"
  }
}
```

---

### 2. Login
`POST /auth/login`

Verifies email and password, returning a signed JWT access token.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "mobileCountryCode": "+91"
  }
}
```

---

### 3. Request OTP
`POST /auth/otp/request`

Sends an OTP for mobile number login. (Development mode uses hardcoded `123456`).

**Request Body**:
```json
{
  "mobileCountryCode": "+91",
  "mobileNumber": "9876543210"
}
```

**Success Response (`200 OK`)**:
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

---

### 4. Verify OTP
`POST /auth/otp/verify`

Verifies the mobile OTP and logs in / creates the user.

**Request Body**:
```json
{
  "mobileCountryCode": "+91",
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Success Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "User 3210",
    "email": "+919876543210@mobile.dhulera.local",
    "mobileNumber": "9876543210",
    "mobileCountryCode": "+91"
  }
}
```

---

### 5. Get Current User
`GET /auth/me`

Protected by `JwtAuthGuard`. Requires Bearer token in the `Authorization` header.

**Headers**:
```http
Authorization: Bearer <access-token>
```

**Success Response (`200 OK`)**:
```json
{
  "id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "mobileCountryCode": "+91",
  "createdAt": "2026-09-09T17:15:00.000Z",
  "updatedAt": "2026-09-09T17:15:00.000Z"
}
```

---

## User Management Endpoints (`/users`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by ID |
| `PATCH` | `/users/:id` | Update user details (`name`, `email`, `mobileNumber`, `mobileCountryCode`) |
| `DELETE` | `/users/:id` | Delete user |
