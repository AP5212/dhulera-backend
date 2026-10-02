# Auth & User API Documentation

Base URL: `http://localhost:5000`

All endpoints return standard JSON envelopes. Protected routes require an `Authorization` header with a valid JWT token (`Bearer <token>`).

---

## Database Table Structure (`public.dhulera_users`)

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment | User ID |
| `name` | `varchar(150)` | Not Null | User full name |
| `email` | `varchar(255)` | Unique, Not Null | Primary login email |
| `password` | `varchar(255)` | Nullable, Hidden (`select: false`) | Bcrypt hashed password |
| `mobile_number` | `varchar(20)` | Unique, Nullable | Contact mobile number |
| `mobile_country_code` | `varchar(10)` | Nullable | Country dial prefix (e.g. `+91`) |
| `created_at` | `timestamp` | Default `CURRENT_TIMESTAMP` | Account creation date |
| `updated_at` | `timestamp` | Default `CURRENT_TIMESTAMP` | Last updated date |
| `role_id` | `bigint` | Nullable | Assigned role ID |
| `is_property_user` | `boolean` | Default `false` | Real estate / property user flag |
| `status` | `varchar(150)` | Default `'ACTIVE'` | Account status (`ACTIVE`, `INACTIVE`, `BLOCKED`, `DELETED`) |
| `is_deleted` | `boolean` | Default `false` | Soft-delete flag |
| `user_otp` | `varchar(10)` | Nullable | Temporary OTP |
| `otp_valid_till` | `timestamp` | Nullable | Expiration timestamp for OTP |

---

## Standard Response Format

### Success Response Envelope
```json
{
  "status": true,
  "message": "Descriptive success message.",
  "data": {}
}
```

### Error Response Envelope
```json
{
  "statusCode": 400,
  "message": "Descriptive error message.",
  "error": "Bad Request"
}
```

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 User Login (Email & Password)
`POST /auth/login`

Authenticates a user with email & password and generates a signed JWT access token.

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "sachin@example.com",
  "password": "password123"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "8",
      "name": "Sachin",
      "email": "sachin@example.com",
      "mobileNumber": null,
      "mobileCountryCode": null,
      "roleId": "1",
      "isPropertyUser": false,
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-09-17T13:07:40.080Z",
      "updatedAt": "2026-09-17T13:07:40.080Z"
    }
  }
}
```

---

### 1.2 User Registration
`POST /auth/register`

Registers a new user account with hashed password and generates an initial JWT access token.

**Request Body**:
```json
{
  "name": "Sachin User",
  "email": "pathaks411@gmail.com",
  "password": "password123",
  "mobileNumber": "7289065211",
  "mobileCountryCode": "+91",
  "isPropertyUser": false,
  "roleId": "1"
}
```

**Field Rules**:
- `name` *(Required, string)*: User full name.
- `email` *(Required, string, valid email)*: Unique email address.
- `password` *(Optional, string)*: Password (hashed with Bcrypt salt rounds 10).
- `mobileNumber` *(Optional, string)*: Contact mobile number.
- `mobileCountryCode` *(Optional, string)*: Country dial code (defaults to `+91`).
- `roleId` *(Optional, string)*: Target role ID (e.g. `"1"`).
- `isPropertyUser` *(Optional, boolean)*: Set to `true` for property posting accounts.

**Success Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "User registered successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "7",
      "name": "Sachin User",
      "email": "pathaks411@gmail.com",
      "mobileNumber": "7289065211",
      "mobileCountryCode": "+91",
      "roleId": "1",
      "isPropertyUser": false,
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-09-17T13:07:37.265Z",
      "updatedAt": "2026-09-17T13:07:37.265Z"
    }
  }
}
```

---

### 1.3 Verify OTP
`POST /auth/verify-otp`

Validates user OTP and activates the account.

**Request Body**:
```json
{
  "email": "pathaks411@gmail.com",
  "otp": "123456"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "OTP verified successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "7",
      "name": "Sachin User",
      "email": "pathaks411@gmail.com",
      "status": "ACTIVE"
    }
  }
}
```

---

### 1.4 Resend OTP
`POST /auth/resend-otp`

Generates and re-dispatches a fresh OTP for the user account.

**Request Body**:
```json
{
  "email": "pathaks411@gmail.com"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "A new OTP has been sent successfully.",
  "data": {
    "email": "pathaks411@gmail.com",
    "mobileNumber": "7289065211"
  }
}
```

---

## 2. User Management Endpoints (`/users`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users/login` | Direct login with email and password |
| `POST` | `/users/create` | Creates a new user record |
| `GET` | `/users` | Returns list of all active non-deleted users |
| `GET` | `/users/:id` | Returns single user details by ID |
| `PATCH` | `/users/:id` | Updates user details |
| `DELETE` | `/users/:id` | Soft-deletes user record (`is_deleted: true`) |

---

### 2.1 Direct Login (`POST /users/login`)
```json
{
  "email": "gnpandey1234@gmail.com",
  "password": "password123"
}
```

**Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "11",
      "name": "Gajanand Pandey",
      "email": "gnpandey1234@gmail.com",
      "mobileNumber": "9711402225",
      "mobileCountryCode": "+91",
      "roleId": "1",
      "isPropertyUser": false,
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-09-23T04:21:37.440Z",
      "updatedAt": "2026-09-23T04:21:57.509Z"
    }
  }
}
```

---

### 2.2 List Users (`GET /users`)

**Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "11",
      "name": "Gajanand Pandey",
      "email": "gnpandey1234@gmail.com",
      "mobileNumber": "9711402225",
      "mobileCountryCode": "+91",
      "roleId": "1",
      "isPropertyUser": false,
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-09-23T04:21:37.440Z",
      "updatedAt": "2026-09-23T04:21:57.509Z"
    },
    {
      "id": "8",
      "name": "Sachin",
      "email": "sachin@example.com",
      "mobileNumber": null,
      "mobileCountryCode": null,
      "roleId": "1",
      "isPropertyUser": false,
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-09-17T13:07:40.080Z",
      "updatedAt": "2026-09-17T13:07:40.080Z"
    }
  ]
}
```

---

### 2.3 Update User (`PATCH /users/:id`)

**Request Body**:
```json
{
  "name": "Sachin Pathak",
  "mobileNumber": "9711402225"
}
```

**Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "User updated successfully.",
  "data": {
    "id": "8",
    "name": "Sachin Pathak",
    "email": "sachin@example.com",
    "mobileNumber": "9711402225",
    "mobileCountryCode": null,
    "roleId": "1",
    "isPropertyUser": false,
    "status": "ACTIVE",
    "isDeleted": false,
    "createdAt": "2026-09-17T13:07:40.080Z",
    "updatedAt": "2026-10-02T16:50:00.000Z"
  }
}
```

---

### 2.4 Delete User (`DELETE /users/:id`)

**Response (`200 OK`)**:
```json
{
  "status": true,
  "message": "User deleted successfully.",
  "data": null
}
```

---

## 3. JWT Token Structure & Authentication

The access token returned upon login/registration is signed using `JWT_SECRET` and contains the following claims:

```json
{
  "sub": "8",
  "user_id": "8",
  "id": "8",
  "email": "sachin@example.com",
  "roleId": "1",
  "name": "Sachin",
  "iat": 1727866200,
  "exp": 1728471000
}
```

To access protected endpoints, include the header:
```http
Authorization: Bearer <accessToken>
```

---

## 4. Common Error Codes

| Status Code | Reason | Resolution |
| :--- | :--- | :--- |
| `400 Bad Request` | Missing required fields or invalid data types | Check request body format and field values |
| `401 Unauthorized` | Invalid email or password, or token expired | Verify credentials or login again to get a fresh token |
| `404 Not Found` | Target user ID does not exist | Verify user ID parameter |
| `409 Conflict` | Email or mobile number already registered | Use a different email or mobile number |
| `500 Internal Error`| Server exception | Check server logs for database connectivity or configuration issues |
