# Contact App

A Node.js contact management assignment using Express, MongoDB and Mongoose. This implementation uses native JavaScript ES modules, separate request handlers and validation middleware, and a JSON API intended for Postman or Thunder Client.

## Getting started

Requirements: Node.js 22 or later, npm, and a local MongoDB installation or an Atlas cluster.

1. Extract the ZIP and open the `addressbook-api` folder in a terminal.
2. Run `npm ci` to install the locked dependencies.
3. Copy `.env.example` to `.env`. On Windows PowerShell: `Copy-Item .env.example .env`. On macOS/Linux: `cp .env.example .env`.
4. Configure `MONGODB_URI` in `.env`. The example URI is `mongodb://127.0.0.1:27017/contact_management`. Start your local MongoDB service, or supply your Atlas URI with its database user and network access configured.
5. Run `npm run dev` for development, or `npm start` for a normal launch.
6. Visit `http://localhost:3000` to see the API entry point. Use Postman for the contact endpoints; this version does not include a graphical contact editor.

The application always uses database **contact_management**. It checks the database connection and initializes unique indexes before accepting requests. `PORT` defaults to 3000. Do not commit `.env` or database credentials.

## Contact model

| Property | Rule |
| --- | --- |
| contactId | Unique string. If omitted, generated as `AB-` plus 24 hexadecimal characters. Custom IDs accept 1–80 letters, digits, underscores or hyphens. Cannot be changed through the update API. |
| name | Required non-blank string, trimmed, maximum 150 characters. |
| phone | Required string of exactly 10 digits. Use quotes so leading zeroes are preserved. |
| email | Optional. When supplied, must be a valid-format string of at most 254 characters; normalized to lowercase, trimmed and unique. |

The assignment explicitly requires name and phone; email is optional. A partial unique index allows multiple contacts without email while preventing duplicate supplied emails. Responses include `createdAt` and `updatedAt`, and omit MongoDB's internal `_id`. Unknown fields, numeric values, null values and blank strings are rejected.

## Endpoint reference

Send request bodies as JSON with `Content-Type: application/json`. **`:id` refers to contactId, not MongoDB `_id`.**

| Request | Purpose | Status |
| --- | --- | --- |
| POST /contacts | Create a contact | 201 |
| GET /contacts | Retrieve all contacts alphabetically | 200 |
| GET /contacts/:id | Retrieve one contact | 200 |
| PUT /contacts/:id | Update supplied fields | 200 |
| DELETE /contacts/:id | Remove a contact | 200 |

### 1. Create

`POST http://localhost:3000/contacts`

```json
{
  "contactId": "A100",
  "name": "Sara Ali",
  "phone": "0123456789",
  "email": "sara@example.com"
}
```

Example 201 response (timestamps vary):

```json
{
  "success": true,
  "message": "Contact created",
  "contact": {
    "contactId": "A100",
    "name": "Sara Ali",
    "phone": "0123456789",
    "email": "sara@example.com",
    "createdAt": "2026-09-29T06:00:00.000Z",
    "updatedAt": "2026-09-29T06:00:00.000Z"
  }
}
```

The Location response header points to `/contacts/A100`.

### 2. List

`GET http://localhost:3000/contacts` returns all contact objects in an array with a count:

```json
{ "success": true, "count": 0, "contacts": [] }
```

The example shows an empty database. When populated, `contacts` contains objects with the fields shown in the create response.

### 3. Retrieve

`GET http://localhost:3000/contacts/A100` returns `{ "success": true, "contact": {...} }`, where contact is the complete stored object shown above.

### 4. Update

`PUT http://localhost:3000/contacts/A100`

```json
{ "name": "Sara Khan", "phone": "9876543210" }
```

Returns `{ "success": true, "message": "Contact updated", "contact": {...} }` with the complete updated contact and refreshed `updatedAt`. Omitted fields retain their existing values. Validation and unique indexes apply to updates. Changing contactId is rejected.

### 5. Delete

`DELETE http://localhost:3000/contacts/A100`

```json
{ "success": true, "message": "Contact deleted", "contactId": "A100" }
```

Fetching the same contact afterward returns 404.

## Error responses

An invalid phone returns 400:

```json
{
  "success": false,
  "message": "Invalid contact details",
  "issues": [
    { "field": "phone", "reason": "Phone must have exactly 10 digits" }
  ]
}
```

Duplicate contactId or email returns 409 with `message: "Duplicate contact"` and an issue identifying the field. Missing contacts return 404 with `message: "Contact does not exist"`. Malformed JSON returns 400. Bodies larger than 16 KB return 413. Unexpected failures return 500 without exposing stack traces or credentials.

## Postman testing

Import `postman/addressbook.json` into Postman. Start the application and set collection variable `baseUrl` to `http://localhost:3000`. Run the entire collection in order: it creates a unique contact, checks all five endpoints and validation failures, then deletes its record. Run against a local demonstration database.

For repeatable checks without a manually configured database:

```sh
npm test
npm run test:postman
```

The integration tests cover CRUD persistence, ordering, generated IDs, optional emails, required fields, duplicate keys, update validation, malformed JSON and missing contacts. The Postman collection is executed using Newman. Each command creates an isolated real MongoDB process through `mongodb-memory-server`; it does not modify the database in `.env`. The first run requires internet access to download MongoDB. To use an existing executable, set `MONGOMS_SYSTEM_BINARY` to its absolute path.

GitHub Actions runs both test commands when the included workflow is uploaded. Newman is a development-only dependency and is not used by the API server.

## Project map

```text
index.mjs                  Environment, database connection and HTTP startup
source/application.mjs     Express configuration
source/entities/contact.mjs Mongoose schema and indexes
source/actions/contacts.mjs CRUD handlers
source/http/routes.mjs     Route declarations
source/http/input.mjs      JSON input validation
source/http/errors.mjs     Error response mapping
checks/                   Integration tests and isolated Postman runner
postman/                  Importable request collection
```

## Upload and submit

Extract the ZIP and upload the **contents** of `addressbook-api` to your GitHub repository. Include `.env.example`, `.gitignore` and `.github/workflows/check.yml`; do not upload `.env` or `node_modules`. The ZIP contains source files, not installed dependencies. You can also push the extracted folder using Git. Submit the repository URL as instructed by your course.

This is a local assignment API with a shared directory and no authentication. Use fictional contact data in demonstrations.
