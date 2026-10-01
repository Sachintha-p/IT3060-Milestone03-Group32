# Smart Library System

> IT3060 Human Computer Interaction — Milestone 03
> Expo (React Native) mobile app + Spring Boot REST API

---

## Team

| # | Name | Student ID | Feature Folder | Responsibility |
|---|------|-----------|----------------|----------------|
| 1 | *(Member 1)* | — | `core/`, `auth/`, `api/`, `context/`, root layouts | Backend core & auth; Frontend base setup |
| 2 | *(Member 2)* | — | `feature1/` (BE) · `features/feature1/` (FE) | Feature 1 |
| 3 | *(Member 3)* | — | `feature2/` (BE) · `features/feature2/` (FE) | Feature 2 |
| 4 | *(Member 4)* | — | `feature3/` (BE) · `features/feature3/` (FE) | Feature 3 |

> Fill in names and student IDs above. Feature 4 can be split between members if there are only 4 in the team.

---

## Folder Structure

```
Smart-Library-System/
├── docs/
│   ├── AI_RULES.md             ← Coding conventions for all members + AI
│   ├── API_CONTRACT.md         ← API endpoint reference (source of truth)
│   ├── milestones/             ← M01 report, M02 prototype files
│   ├── screenshots/            ← UI screenshots for submission
│   └── testing/                ← Test plans and results
│
├── backend/smart-campus-backend/
│   └── src/main/java/com/library/smart_campus_backend/
│       ├── core/               ← Lead only: security, config, exception, common
│       ├── auth/               ← Lead only: User, JWT, register/login
│       ├── feature1/ … feature4/   ← One per member (controller/service/repository/model/dto)
│       └── SmartCampusBackendApplication.java
│
└── frontend/
    └── src/
        ├── api/                ← Axios client (Lead only)
        ├── context/            ← AuthContext (Lead only)
        ├── utils/              ← Shared utilities
        ├── constants/theme.ts  ← Design tokens (Lead only)
        ├── components/         ← Shared components (Lead only)
        ├── hooks/              ← Shared hooks (Lead only)
        ├── app/                ← Expo Router routes (thin re-exports only)
        │   ├── _layout.tsx     ← Root layout + auth redirect
        │   ├── (auth)/         ← login, register
        │   └── (tabs)/         ← Home + 4 feature tabs
        └── features/           ← All business screens (one per member)
            ├── feature1/screens/, components/, api/, hooks/, types/
            ├── feature2/ …
            ├── feature3/ …
            └── feature4/ …
```

---

## Ownership Rules

| Folder / File | Owner |
|---|---|
| `core/`, `auth/` (backend) | Team Lead |
| `api/`, `context/`, `constants/`, `components/`, `hooks/` (frontend) | Team Lead |
| `src/app/_layout.tsx`, `src/app/(auth)/`, `src/app/(tabs)/_layout.tsx` | Team Lead |
| `src/app/(tabs)/featureN/index.tsx` | **Each member edits only their own** |
| `backend/featureN/` | **Each member edits only their own** |
| `frontend/src/features/featureN/` | **Each member edits only their own** |
| `docs/API_CONTRACT.md` | All — discuss and PR before changing |

---

## Git Branch Strategy

```
main          ← production-ready; merge only from develop via PR + review
  └── develop ← integration; all feature branches merge here
        ├── feature/lead-auth-setup
        ├── feature/member2-feature1-screens
        ├── feature/member3-feature2-backend
        └── ...
```

**Commit format:** `feat: add book search screen` | `fix: login error message` | `docs: update API contract`

---

## Setup & Run

### Prerequisites
- Java 17
- Maven (or use the `mvnw` wrapper)
- PostgreSQL 15+
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)

---

### 1. Database (PostgreSQL)

```sql
-- Run once
CREATE DATABASE smart_library;
CREATE USER smart_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_library TO smart_user;
```

---

### 2. Backend

```bash
# Navigate to backend
cd backend/smart-campus-backend

# Set environment variables (PowerShell example)
$env:DB_URL     = "jdbc:postgresql://localhost:5432/smart_library"
$env:DB_USERNAME = "smart_user"
$env:DB_PASSWORD = "your_password"
$env:JWT_SECRET = "dGhpcyBpcyBhIHZlcnkgc2VjdXJlIHNlY3JldCBrZXkgZm9yIFNtYXJ0TGli"

# Run with dev profile (auto-creates schema, shows SQL)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or just run (validates schema — needs DB to exist)
./mvnw spring-boot:run
```

Swagger UI: http://localhost:8080/swagger-ui.html

---

### 3. Frontend

```bash
# Navigate to frontend
cd frontend

# Copy and edit the environment file
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL to your backend IP

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Specific platforms
npx expo start --android   # Android emulator
npx expo start --ios       # iOS simulator (macOS only)
npx expo start --web       # Web browser
```

> **Physical device:** Make sure backend and phone are on the same Wi-Fi.
> Set `EXPO_PUBLIC_API_URL=http://<your-laptop-ip>:8080` in `.env`.

---

### 4. Type Check (Frontend)

```bash
cd frontend
npx tsc --noEmit
```

### 5. Lint

```bash
cd frontend
npx expo lint
```
