# User API Documentation

Base URL: `http://localhost:3000`

All endpoints return JSON. The Users controller does not currently apply an authentication guard. Send `Content-Type: application/json` with every `POST` request.

## Validation and behavior

- `username`, `firstName`, `password`, and `roleId` are required during registration and cannot be blank.
- Login requires non-blank `username` and `password`.
- `email` is optional; when provided, it must be a valid email address.
- `mobileNumber` is optional; when provided, it must contain digits only. Send it as a string so a leading zero is retained.
- ID fields (`id`, `roleId`, `parentId`, `stateId`, `districtId`, `subDistrictId`, `createdBy`, `updatedBy`) must be positive integers. Use strings for IDs because database IDs are bigints.
- Optional text fields may be omitted or sent as `null`; supplied text cannot be blank.
- A registered user always starts with `status: "ACTIVE"`; the request cannot set the status.
- Usernames, email addresses, and mobile numbers are unique at the database level.
- Passwords are never returned in an API response.

Successful responses use this envelope:

```json
{ "status": true, "message": "Descriptive success message", "data": {} }
```

Error responses use this envelope:

```json
{ "status": false, "message": "Descriptive error message" }
```

## Endpoint summary

| Action | Endpoint | Success status |
| --- | --- | --- |
| Register user | `POST /users/register` | `201` |
| Log in | `POST /users/login` | `201` |
| List users | `GET /users` | `200` |
| Get user | `GET /users/:id` | `200` |
| Delete user | `POST /users/delete/:id` | `201` |

## 1. Register user

`POST /users/register`

Request body:

```json
{
  "username": "9711402225",
  "firstName": "Gajanand",
  "lastName": "Pandey",
  "email": "gnpandey1234@gmail.com",
  "mobileNumber": "9711402225",
  "password": "Pintu@f1987",
  "roleId": "1",
  "parentId": null,
  "stateId": "1",
  "districtId": "1",
  "subDistrictId": "1",
  "location": "Dholera",
  "createdBy": "1"
}
```

Required: `username`, `firstName`, `password`, `roleId`.

Optional: `lastName`, `email`, `mobileNumber`, `parentId`, `stateId`, `districtId`, `subDistrictId`, `location`, `createdBy`.

Success response (`201`):

```json
{
  "status": true,
  "message": "User registered successfully.",
  "data": {
    "id": "1",
    "username": "anita.sharma",
    "firstName": "Anita",
    "lastName": "Sharma",
    "email": "anita@example.com",
    "mobileNumber": "9876543210",
    "roleId": "1",
    "parentId": null,
    "stateId": "1",
    "districtId": "1",
    "subDistrictId": "1",
    "location": "Jaipur",
    "emailVerified": false,
    "mobileVerified": false,
    "lastLoginAt": null,
    "failedLoginCount": 0,
    "lockedUntil": null,
    "status": "ACTIVE",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

## 2. Login

`POST /users/login`

Request body:

```json
{
  "username": "9711402225",
  "password": "Pintu@f1987"
}
```

Both fields are required and cannot be blank. Only users with `ACTIVE` status can sign in. A successful login updates the user's `lastLoginAt` and resets `failedLoginCount` to `0`.

Success response (`201`):

```json
{
  "status": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "<JWT access token>"
  }
}
```

## 3. List users

`GET /users`

Returns every user except soft-deleted users, ordered by `firstName` and then `lastName` in ascending order. The response `data` is an array of the user object shown above.

Success response message: `Users retrieved successfully.`

## 4. Get user by ID

`GET /users/:id`

Example: `GET /users/1`

The ID must be a positive integer. Soft-deleted users are treated as not found.

Success response message: `User retrieved successfully.`

## 5. Delete user

`POST /users/delete/:id`

Example: `POST /users/delete/1`

Request body:

```json
{ "updatedBy": "1" }
```

`updatedBy` is optional but, when supplied, must be a positive integer. This performs a soft delete by setting the user's status to `DELETED`; the user is then excluded from list and single-user endpoints.

Success response message: `User deleted successfully.`

## Common errors

- `400 Bad Request`: a required text field is blank, email format is invalid, mobile number contains non-digits, an ID is invalid, or `PASSWORD_ENCRYPTION_KEY` is not configured.
- `401 Unauthorized`: the username/password is invalid, or the user's status is not `ACTIVE`.
- `404 Not Found`: the user does not exist or has been soft-deleted.
- `500 Internal Server Error`: an unexpected server or database error, including a database uniqueness violation.
