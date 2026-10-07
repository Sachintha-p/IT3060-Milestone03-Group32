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
| POST | `/api/auth/login` | No |

### POST /api/auth/login

**Request JSON:**
```json
{ 
  "identifier": "it20000000@my.sliit.lk", 
  "password": "secret123",
  "portal": "STUDENT" 
}
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

## Feature 1 Endpoints (Space Management)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/public/spaces` | No | List all spaces. Optional query params: `?floor=&zone=&zone=&hasPower=&hasPc=` |
| GET | `/api/public/spaces/{id}` | No | Get space details and timeslots |
| GET | `/api/public/zones/summary` | No | Summary of space usage per floor and zone |
| POST | `/api/reservations` | Yes | Create a new reservation |
| GET | `/api/reservations/me` | Yes | List user's active/checked-in reservations |
| PUT | `/api/reservations/{id}/check-in` | Yes | Check into a reservation |
| DELETE | `/api/reservations/{id}` | Yes | Cancel a reservation (soft delete) |

**Request JSON (POST /api/reservations):**
```json
{
  "spaceId": 1,
  "date": "2026-10-02",
  "startTime": "10:00:00",
  "endTime": "11:00:00"
}
```

**Response JSON (201):**
```json
{
    "success": true,
    "message": "Reservation created successfully",
    "data": { 
      "id": 1, 
      "code": "A1B2C3D4",
      "space": {
        "id": 1,
        "name": "Desk B1",
        "floorLabel": "Floor 1 (Quiet)",
        "zone": "SILENT_STUDY",
        "type": "DESK",
        "status": "AVAILABLE"
      },
      "reservationDate": "2026-10-02",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "status": "RESERVED",
    "createdAt": "2026-10-02T10:00:00"
  }
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
