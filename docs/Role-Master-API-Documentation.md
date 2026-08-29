# Role Master API Documentation

Base URL: `http://localhost:3000`

All endpoints return JSON. Authentication is not currently required by this module. Send `Content-Type: application/json` for `POST` requests.

## Allowed values and field rules

- `status`: `ACTIVE`, `INACTIVE`, or `DELETED`. It defaults to `ACTIVE` when a role is created.
- `id`, `createdBy`, and `updatedBy` are positive integer IDs. Send them as strings to avoid JavaScript integer precision issues.
- `roleCode` and `roleName` must be non-empty strings. Their database column limits are 50 and 100 characters, respectively.
- `description` is optional. Pass `null` to clear it during an update.
- Both `roleCode` and `roleName` are unique, including for soft-deleted records.

## Response format

Successful responses use this envelope:

```json
{
  "status": true,
  "message": "Role created successfully.",
  "data": {}
}
```

Errors use this envelope:

```json
{
  "status": false,
  "message": "Descriptive error message"
}
```

## 1. Create role

`POST /roles/create`

Request body:

```json
{
  "roleCode": "ADMIN",
  "roleName": "Administrator",
  "description": "Full administrative access.",
  "status": "ACTIVE",
  "createdBy": "1"
}
```

Required fields: `roleCode`, `roleName`. The remaining fields are optional.

Success response (`201`):

```json
{
  "status": true,
  "message": "Role created successfully.",
  "data": {
    "id": "1",
    "roleCode": "ADMIN",
    "roleName": "Administrator",
    "description": "Full administrative access.",
    "status": "ACTIVE",
    "createdBy": "1",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedBy": null,
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

## 2. Get all roles

`GET /roles`

Returns all roles ordered by `roleName` ascending, including roles whose status is `INACTIVE` or `DELETED`.

Success response (`200`):

```json
{
  "status": true,
  "message": "Roles retrieved successfully.",
  "data": [
    {
      "id": "1",
      "roleCode": "ADMIN",
      "roleName": "Administrator",
      "description": "Full administrative access.",
      "status": "ACTIVE",
      "createdBy": "1",
      "createdAt": "2026-08-29T00:00:00.000Z",
      "updatedBy": null,
      "updatedAt": "2026-08-29T00:00:00.000Z"
    }
  ]
}
```

## 3. Get one role

`GET /roles/:id`

Example: `GET /roles/1`

The `id` must be a positive integer.

Success response (`200`):

```json
{
  "status": true,
  "message": "Role retrieved successfully.",
  "data": {
    "id": "1",
    "roleCode": "ADMIN",
    "roleName": "Administrator",
    "description": "Full administrative access.",
    "status": "ACTIVE",
    "createdBy": "1",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedBy": null,
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

## 4. Update role

`POST /roles/update/:id`

Example: `POST /roles/update/1`

Request body:

```json
{
  "roleName": "System Administrator",
  "description": "Manages the system and users.",
  "status": "ACTIVE",
  "updatedBy": "1"
}
```

All body fields are optional. Omitted `roleCode`, `roleName`, and `status` fields retain their existing values. To clear the description, send `"description": null`.

Success response (`201`):

```json
{
  "status": true,
  "message": "Role updated successfully.",
  "data": {
    "id": "1",
    "roleCode": "ADMIN",
    "roleName": "System Administrator",
    "description": "Manages the system and users.",
    "status": "ACTIVE",
    "createdBy": "1",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedBy": "1",
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

## 5. Delete role

`POST /roles/delete/:id`

Example: `POST /roles/delete/1`

Request body:

```json
{
  "updatedBy": "1"
}
```

This is a soft delete: the role remains in the database and its `status` is changed to `DELETED`.

Success response (`201`):

```json
{
  "status": true,
  "message": "Role deleted successfully.",
  "data": {
    "id": "1",
    "roleCode": "ADMIN",
    "roleName": "System Administrator",
    "description": "Manages the system and users.",
    "status": "DELETED",
    "createdBy": "1",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedBy": "1",
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

## Common errors

- `400 Bad Request`: a required text value is empty, a status is invalid, or an ID is not a positive integer.
- `404 Not Found`: the role ID does not exist.
- `409 Conflict`: the requested role code or name is already in use.
- `500 Internal Server Error`: an unexpected server or database error.
