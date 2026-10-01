# Smart Library System — API Contract

> **Rule:** All frontend code must call endpoints exactly as specified here.
> All backend code must implement them exactly as specified here.
> Discuss and update this document before changing any endpoint.

---

## Base URL

| Environment | URL |
|---|---|
| Android Emulator | `http://10.0.2.2:8080` |
| Physical Device (same Wi-Fi) | `http://<laptop-IP>:8080` |
| Production | TBD |

## Common Response Envelope

All successful responses use `ApiResponse<T>`:
```json
{ "success": true, "message": "...", "data": { ... } }
```

All error responses use `ApiError`:
```json
{ "timestamp": "...", "status": 400, "error": "...", "message": "...", "path": "..." }
```

## Authentication Header

```
Authorization: Bearer <JWT>
```

---

## Auth Endpoints (implemented)

| Method | URL | Auth Required |
|--------|-----|---------------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |

### POST /api/auth/register

**Request JSON:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response JSON (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "<JWT>",
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

### POST /api/auth/login

**Request JSON:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Response JSON (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT>",
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT"
  }
}
```

---

## Feature 1 Endpoints

> Replace `feature1` with the actual feature name once confirmed.

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/feature1` | Yes | List all items |
| GET | `/api/feature1/{id}` | Yes | Get item by ID |
| POST | `/api/feature1` | Yes | Create a new item |
| PUT | `/api/feature1/{id}` | Yes | Update an item |
| DELETE | `/api/feature1/{id}` | Yes (ADMIN) | Delete an item |

**Request JSON (POST/PUT):**
```json
{
  "field1": "value",
  "field2": "value"
}
```

**Response JSON (200/201):**
```json
{
  "success": true,
  "message": "...",
  "data": { "id": 1, "field1": "value", "field2": "value" }
}
```

---

## Feature 2 Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/feature2` | Yes | List all items |
| GET | `/api/feature2/{id}` | Yes | Get item by ID |
| POST | `/api/feature2` | Yes | Create a new item |
| PUT | `/api/feature2/{id}` | Yes | Update an item |
| DELETE | `/api/feature2/{id}` | Yes (ADMIN) | Delete an item |

---

## Feature 3 Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/feature3` | Yes | List all items |
| GET | `/api/feature3/{id}` | Yes | Get item by ID |
| POST | `/api/feature3` | Yes | Create a new item |
| PUT | `/api/feature3/{id}` | Yes | Update an item |
| DELETE | `/api/feature3/{id}` | Yes (ADMIN) | Delete an item |

---

## Feature 4 Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/feature4` | Yes | List all items |
| GET | `/api/feature4/{id}` | Yes | Get item by ID |
| POST | `/api/feature4` | Yes | Create a new item |
| PUT | `/api/feature4/{id}` | Yes | Update an item |
| DELETE | `/api/feature4/{id}` | Yes (ADMIN) | Delete an item |
