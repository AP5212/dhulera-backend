# User & Authentication API Documentation

Base URL: `http://localhost:5000`

All endpoints return JSON responses. Send `Content-Type: application/json` for requests with payloads. Protected routes require a Bearer token in the `Authorization` header (`Authorization: Bearer <access-token>`).

---

## Database Table Schema (`public.dhulera_users`)

| Column Name | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigint` | Primary Key, Auto Increment | Unique user identifier |
| `name` | `varchar(150)` | Not Null | Full user name |
| `email` | `varchar(255)` | Unique, Not Null | Primary login email |
| `password` | `varchar(255)` | Nullable, Hidden (`select: false`) | Bcrypt hashed password |
| `mobile_number` | `varchar(20)` | Unique, Nullable | Contact mobile number |
| `mobile_country_code` | `varchar(10)` | Nullable | Country dial code (e.g. `+91`) |
| `created_at` | `timestamp` | Default `CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `timestamp` | Default `CURRENT_TIMESTAMP` | Last updated timestamp |
| `role_id` | `bigint` | Nullable | Assigned role identifier |
| `is_property_user` | `boolean` | Default `false` | Real estate / property user flag |
| `status` | `varchar(150)` | Default `'ACTIVE'` | Account status (`ACTIVE`, `INACTIVE`, `BLOCKED`, `DELETED`) |
| `is_deleted` | `boolean` | Default `false` | Soft-deletion flag |
| `user_otp` | `varchar(10)` | Nullable | Temporary OTP string |
| `otp_valid_till` | `timestamp` | Nullable | Expiration timestamp for OTP |

---

## Response Envelopes

### Success Envelope
```json
{
  "status": true,
  "message": "Operation description",
  "data": {}
}
```

### Error Envelope
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

---

## 1. User Login (Email & Password)

`POST /users/login` (or `POST /auth/login`)

Authenticates an existing user via `email` and `password`.

### Request Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "email": "sachin@example.com",
  "password": "password123"
}
```

### Success Response (`200 OK`)
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

## 2. User Registration / Create User

`POST /users/create` (or `POST /auth/register`)

Creates a new user account with hashed password and returns the sanitized user profile.

### Request Body
```json
{
  "name": "Gajanand Pandey",
  "email": "gnpandey1234@gmail.com",
  "password": "password123",
  "mobileNumber": "9711402225",
  "mobileCountryCode": "+91",
  "roleId": "1",
  "isPropertyUser": false
}
```

### Field Specifications
- `name` *(Required, string)*: Full name of the user.
- `email` *(Required, string, email)*: Unique email address.
- `password` *(Optional, string)*: User password (will be securely hashed with Bcrypt 10 rounds).
- `mobileNumber` *(Optional, string)*: Mobile number without country code.
- `mobileCountryCode` *(Optional, string)*: Country code prefix (default `+91`).
- `roleId` *(Optional, string)*: Identifier of the role assigned to the user.
- `isPropertyUser` *(Optional, boolean)*: Property user indicator (default `false`).

### Success Response (`201 Created`)
```json
{
  "status": true,
  "message": "User created successfully.",
  "data": {
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
    "updatedAt": "2026-09-23T04:21:37.440Z"
  }
}
```

---

## 3. List All Users

`GET /users`

Retrieves all non-deleted active users in descending order of creation.

### Success Response (`200 OK`)
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

## 4. Get User By ID

`GET /users/:id`

Retrieves details for a specific user by their database primary key.

### Path Parameters
- `id` *(Required, integer string)*: Numeric User ID (e.g. `8`, `11`).

### Success Response (`200 OK`)
```json
{
  "status": true,
  "message": "User retrieved successfully.",
  "data": {
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
```

---

## 5. Update User

`PATCH /users/:id`

Updates fields on an existing user. Password updates will be automatically hashed.

### Path Parameters
- `id` *(Required, integer string)*: Target User ID to update.

### Request Body
```json
{
  "name": "Sachin Updated",
  "mobileNumber": "9876543210",
  "mobileCountryCode": "+91"
}
```

### Success Response (`200 OK`)
```json
{
  "status": true,
  "message": "User updated successfully.",
  "data": {
    "id": "8",
    "name": "Sachin Updated",
    "email": "sachin@example.com",
    "mobileNumber": "9876543210",
    "mobileCountryCode": "+91",
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

## 6. Delete User (Soft Delete)

`DELETE /users/:id`

Marks the user account as deleted (`is_deleted: true`, `status: INACTIVE`).

### Path Parameters
- `id` *(Required, integer string)*: Target User ID.

### Success Response (`200 OK`)
```json
{
  "status": true,
  "message": "User deleted successfully.",
  "data": null
}
```

---

## 7. OTP Verification (Optional Verification Flow)

`POST /auth/verify-otp`

Validates user OTP and activates the account.

### Request Body
```json
{
  "email": "pathaks411@gmail.com",
  "otp": "123456"
}
```

### Success Response (`200 OK`)
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

## Common Error Codes

| Status Code | Error Type | Cause |
| :--- | :--- | :--- |
| `400 Bad Request` | Validation Error | Missing required fields, invalid email format, expired/invalid OTP |
| `401 Unauthorized` | Auth Error | Incorrect email/password combination or deactivated account |
| `404 Not Found` | Entity Missing | User ID does not exist |
| `409 Conflict` | Duplicate Key | Email address or mobile number is already registered |
| `500 Internal Error`| Server Exception | Unhandled database or system exception |
