# Location Master API Documentation

Base URL: `http://localhost:3000`

All endpoints return JSON. Send `Content-Type: application/json` with every `POST` request. The three create endpoints require an access token; read, update, and delete endpoints currently do not.

For create requests, send either `Authorization: Bearer <access-token>` or `Authorization: <access-token>`.

## Conventions and validation

- `status` accepts `ACTIVE`, `INACTIVE`, or `DELETED`; it defaults to `ACTIVE` when a record is created.
- IDs (`id`, `stateId`, `districtId`, and `updatedBy`) must be positive integers. Send IDs as strings to preserve bigint precision.
- For state, district, and sub-district creation, `createdBy` is set from the authenticated token's `user_id` claim and must not be included in the request body.
- Codes and names must be non-empty strings; leading and trailing whitespace is removed.
- A district can be created or moved only under an existing active state. A sub-district can be created or moved only under an existing active district.
- State codes and names are unique without regard to letter case or surrounding whitespace. District codes are unique within a state, and sub-district codes are unique within a district, using the same comparison.
- Deletes are soft deletes: the record stays in the database with `status: "DELETED"`. List endpoints include active, inactive, and deleted records.

Success responses use:

```json
{ "status": true, "message": "Descriptive success message", "data": {} }
```

Errors use:

```json
{ "status": false, "message": "Descriptive error message" }
```

## Endpoint summary

| Resource | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| States | `POST /location/states/create` | `GET /location/states`, `GET /location/states/:id` | `POST /location/states/update/:id` | `POST /location/states/delete/:id` |
| Districts | `POST /location/districts/create` | `GET /location/districts`, `GET /location/districts/:id` | `POST /location/districts/update/:id` | `POST /location/districts/delete/:id` |
| Sub-districts | `POST /location/sub-districts/create` | `GET /location/sub-districts`, `GET /location/sub-districts/:id` | `POST /location/sub-districts/update/:id` | `POST /location/sub-districts/delete/:id` |

All create, update, and delete endpoints return `201`. Read endpoints return `200`.

## States

### Create state

`POST /location/states/create`

```json
{
  "stateCode": "RJ",
  "stateName": "Rajasthan",
  "status": "ACTIVE"
}
```

Required: `stateCode`, `stateName`. Optional: `status`. A valid access token is required; the token's `user_id` is saved as `createdBy`.

### List or get a state

- `GET /location/states` — returns states ordered by `stateName`.
- `GET /location/states/:id` — example: `GET /location/states/1`.

### Update state

`POST /location/states/update/:id`

```json
{
  "stateName": "Rajasthan State",
  "status": "ACTIVE",
  "updatedBy": "1"
}
```

All request fields are optional. Omitted `stateCode`, `stateName`, and `status` retain their current values.

### Delete state

`POST /location/states/delete/:id`

```json
{ "updatedBy": "1" }
```

## Districts

### Create district

`POST /location/districts/create`

```json
{
  "stateId": "1",
  "districtCode": "JPR",
  "districtName": "Jaipur",
  "status": "ACTIVE"
}
```

Required: `stateId`, `districtCode`, `districtName`. `stateId` must identify an active state. Optional: `status`. A valid access token is required; the token's `user_id` is saved as `createdBy`.

### List or get a district

- `GET /location/districts` — returns all districts ordered by `districtName`.
- `GET /location/districts?stateId=1` — returns districts belonging to state ID `1`.
- `GET /location/districts/:id` — example: `GET /location/districts/1`.

### Update district

`POST /location/districts/update/:id`

```json
{
  "stateId": "1",
  "districtName": "Jaipur District",
  "updatedBy": "1",
  "status": "ACTIVE"
}
```

All request fields are optional. If supplied, `stateId` must identify an active state. Omitted fields retain their current values.

### Delete district

`POST /location/districts/delete/:id`

```json
{ "updatedBy": "1" }
```

## Sub-districts

### Create sub-district

`POST /location/sub-districts/create`

```json
{
  "districtId": "1",
  "subDistrictCode": "SANG",
  "subDistrictName": "Sanganer",
  "status": "ACTIVE"
}
```

Required: `districtId`, `subDistrictCode`, `subDistrictName`. `districtId` must identify an active district. Optional: `status`. A valid access token is required; the token's `user_id` is saved as `createdBy`.

### List or get a sub-district

- `GET /location/sub-districts` — returns all sub-districts ordered by `subDistrictName`.
- `GET /location/sub-districts?districtId=1` — returns sub-districts belonging to district ID `1`.
- `GET /location/sub-districts/:id` — example: `GET /location/sub-districts/1`.

### Update sub-district

`POST /location/sub-districts/update/:id`

```json
{
  "districtId": "1",
  "subDistrictName": "Sanganer Tehsil",
  "updatedBy": "1",
  "status": "ACTIVE"
}
```

All request fields are optional. If supplied, `districtId` must identify an active district. Omitted fields retain their current values.

### Delete sub-district

`POST /location/sub-districts/delete/:id`

```json
{ "updatedBy": "1" }
```

## Response examples

State creation response (`201`):

```json
{
  "status": true,
  "message": "State created successfully.",
  "data": {
    "id": "1",
    "stateCode": "RJ",
    "stateName": "Rajasthan",
    "status": "ACTIVE",
    "createdBy": "1",
    "createdAt": "2026-08-29T00:00:00.000Z",
    "updatedBy": null,
    "updatedAt": "2026-08-29T00:00:00.000Z"
  }
}
```

District creation response uses `stateId`, `districtCode`, and `districtName` in the same response shape. Sub-district creation uses `districtId`, `subDistrictCode`, and `subDistrictName`.

## Common errors

- `400 Bad Request`: a required value is blank, an ID is invalid, status is invalid, or a supplied parent state/district is not active.
- `401 Unauthorized`: a create request does not include a valid, non-expired access token.
- `404 Not Found`: the requested state, district, or sub-district does not exist.
- `409 Conflict`: a duplicate state code/name, district code within a state, or sub-district code within a district was requested.
- `500 Internal Server Error`: an unexpected server or database error.
