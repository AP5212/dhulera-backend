# Static Content API Documentation

Base URL: `http://localhost:3000`

All endpoints return JSON. Send `Content-Type: application/json` with every `POST` request.

## Authentication

`POST /static-content/create` requires an access token. Send either `Authorization: Bearer <access-token>` or `Authorization: <access-token>`.

The API validates the token before creating content and stores its `user_id` claim as `addedBy`. Do not send `addedBy` in the request body.

## Create static content

`POST /static-content/create`

```json
{
  "contentType": "ABOUT_US",
  "content": "About our organization.",
  "status": "ACTIVE"
}
```

Required: `contentType`, `content`. Optional: `status`, which defaults to `ACTIVE`.

`contentType` must be one of `ABOUT_US`, `PRIVACY_POLICY`, `TERMS_AND_CONDITIONS`, `CONTACT_US`, or `FAQ`. Only one record per content type may exist.

Success response (`201`):

```json
{
  "status": true,
  "message": "Static content created successfully.",
  "data": {
    "id": "1",
    "contentType": "ABOUT_US",
    "content": "About our organization.",
    "addedBy": "1",
    "status": "ACTIVE"
  }
}
```

## Other endpoints

- `POST /static-content/update/:id`
- `POST /static-content/delete/:id`
- `GET /static-content/:id`

## Common errors

- `400 Bad Request`: required content is blank, the content type or status is invalid, or an ID is invalid.
- `401 Unauthorized`: the create token is missing, invalid, or expired.
- `404 Not Found`: the requested static-content record does not exist.
- `409 Conflict`: content already exists for the supplied content type.
