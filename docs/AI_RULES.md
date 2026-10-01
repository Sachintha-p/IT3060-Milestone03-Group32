# Smart Library System — AI Coding Rules

These rules apply to **all** code written or generated for this project.
Every team member (and any AI assistant) must follow them.

---

## Backend Rules (Java / Spring Boot)

1. **Java 17** — use Java 17 language features only (no preview features).
2. **Spring Boot 4** — follow Spring Boot 4 / Spring Framework 6 conventions.
3. **Layered architecture:** `Controller → Service → Repository`
   - Controllers validate input and delegate to the service.
   - Services contain all business logic.
   - Repositories contain only data access code.
4. **Never return entities from controllers.** Always map to a DTO before returning.
5. **Use `ApiResponse<T>`** from `core/common` for all success responses.
6. **Throw `ResourceNotFoundException`** for missing entities; let `GlobalExceptionHandler` handle it.
7. **Validate all request bodies** with `@Valid` + Bean Validation annotations.
8. **Use Lombok** (`@Data`, `@Builder`, `@RequiredArgsConstructor`) to reduce boilerplate.
9. **Package ownership:**
   - `core/`, `auth/` — owned by the Team Lead only.
   - `feature1/` … `feature4/` — each owned exclusively by the assigned member.
   - **Never edit files outside your own package.**
10. **No secrets in code.** All credentials come from environment variables.

---

## Frontend Rules (TypeScript / Expo)

1. **TypeScript** — strict mode; no `any` types without a comment explaining why.
2. **Expo Router** — use file-based routing (`src/app/`). No manual `NavigationContainer`.
3. **Functional components and hooks** — no class components.
4. **Route files (`src/app/`) must only re-export screens from `src/features/`.**
   ```tsx
   // CORRECT
   export { default } from '@/features/feature1/screens/MyScreen';
   // WRONG — business logic does not belong in route files
   ```
5. **Each member owns only their `src/features/featureN/` folder.**
   Do not edit files outside it (except route index files which just re-export).
6. **Use `@/` imports** (mapped to `src/`); never use relative `../../` imports across feature boundaries.
7. **Use design tokens from `src/constants/theme.ts`** — no magic numbers for colors, spacing, or font sizes.
8. **Match the Milestone 02 prototype exactly.** If a screen looks different, fix it.
9. **All API calls go through `src/api/client.ts`.** Do not call `fetch` directly.
10. **All endpoints must match `docs/API_CONTRACT.md` exactly** — discuss before changing.

---

## Git Rules

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready only. Protected — merge via PR. |
| `develop` | Integration branch. All feature branches merge here. |
| `feature/<member>-<task>` | One branch per task per member. |

- Commit messages: `feat: add book search screen` / `fix: login error handling`
- PR requires at least 1 review before merging to `develop`.
- Never force-push to `main` or `develop`.

---

## Simple, Commented Code

- Write code that a junior developer can read without documentation.
- Add a one-line comment above every class and public method.
- Keep methods under 30 lines where possible; extract helpers otherwise.
