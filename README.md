# Transport Management Platform

Java 21 / Spring Boot REST backend, PostgreSQL, and a React / TypeScript frontend for transport administration. The current implementation covers accounts, vehicles, and basic driver assignments. Trips, bookings, packages, and distributed services are planned in [PRD.md](PRD.md) and [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md).

**Resuming development? Read [BUILD_HANDOFF.md](BUILD_HANDOFF.md) first.** It records completed changes, verification results, known limitations, and the next task.

## Learning checkpoint

Foundation configuration is ready. We are stopping here so the remaining implementation can be built together in small steps. The project still has one backend and one frontend. Docker image builds and real database/browser workflows remain unverified while the Docker engine is stopped; the Java tests, frontend build, and Compose configuration checks have passed.

Start by understanding one existing request:

```text
React page -> api/endpoints.ts -> api/client.ts
  -> JWT/security filters -> REST controller -> service -> repository -> PostgreSQL
```

| Read | What to learn |
|---|---|
| `Backend/pom.xml` | Backend dependencies, Java version, and build plugins. |
| `Backend/src/main/resources/application.properties` | Database, JWT, CORS, and runtime settings. |
| `Backend/src/main/java/org/transport/config/SecurityConfig.java` | Public/protected routes and JWT filter placement. |
| `Backend/src/main/java/org/transport/controller/AuthController.java` and `service/AuthService.java` | How an HTTP login/register request reaches business logic. |
| `Backend/src/main/java/org/transport/repository/UserRepository.java` | How the backend accesses persisted users. |
| `Backend/src/test/java/org/transport/security/RestSecurityIntegrationTest.java` | How requests, tokens, roles, and responses are verified. |
| `Backend/docker-compose.yml` and both Dockerfiles | How the database, API, and browser app are configured to run together. |

When we continue, run the app, trace login and profile requests, then choose a small next change. Flyway adoption and the Identity/Operations/Notifications split remain future guided steps. The roadmap does not mean those services have already been created.

## Run with Docker Compose

Prerequisites: Docker Desktop with the Linux container engine running, Docker Compose v2, and PowerShell. Run commands from the repository root.

```powershell
# Creates ignored Backend/.env and a random JWT secret; preserves existing settings.
./scripts/Initialize-LocalEnvironment.ps1

docker compose -f Backend/docker-compose.yml config --quiet
docker compose -f Backend/docker-compose.yml up --build -d
docker compose -f Backend/docker-compose.yml ps
```

The backend image runs the tests during its Maven build. The frontend image installs from the pnpm lockfile, builds the app, and serves it using Nginx. PostgreSQL readiness gates backend startup; backend health gates frontend startup. Nginx proxies `/api/` to the backend and supports client-side routes. This is currently one backend deployment, not the planned microservices or a load-balanced deployment.

| Location | Address |
|---|---|
| Web app | `http://localhost:5173` |
| API | `http://localhost:8080/api` |
| Health | `http://localhost:8080/api/actuator/health` |
| Swagger UI | `http://localhost:8080/api/swagger-ui.html` |

```powershell
docker compose -f Backend/docker-compose.yml logs --tail 100 backend
docker compose -f Backend/docker-compose.yml stop
```

The existing PostgreSQL service, `logistics_db` container name, and `transportapp_postgres_data` volume key are retained. Use the same Compose file/project name to retain the existing volume mapping. Changing database environment variables does not change credentials inside an already initialized volume. Back up existing data before schema work; this increment still uses Hibernate `update` pending a verified Flyway migration.

## Provision the first administrator

Before first startup, edit ignored `Backend/.env`:

```dotenv
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=your-admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=choose-a-unique-password
```

Use your own email and a password of at least 12 characters and at most 72 UTF-8 bytes. These displayed values are examples, not preconfigured accounts. Enable bootstrap on only one instance for initial provisioning. It creates an active administrator only if no administrator exists, refuses to promote an existing account, and never resets existing administrator credentials. Public registration always creates clients.

After successful startup, log in, then set `BOOTSTRAP_ADMIN_ENABLED=false`, remove the bootstrap password from `.env`, and recreate the backend:

```powershell
docker compose -f Backend/docker-compose.yml up -d --force-recreate backend
```

Administrators can create driver accounts through the existing administration UI/API. If the database already contains administrators, use those accounts; bootstrap is not a password-reset mechanism.

## Run locally for development

Prerequisites: JDK 21, Maven 3.9, Node.js 24, and pnpm 10.11.0 (the version in `frontend/package.json`). Verify Maven's effective JDK with `mvn -version`; the `java` executable on PATH may be a different installation.

```powershell
./scripts/Initialize-LocalEnvironment.ps1
docker compose -f Backend/docker-compose.yml up -d postgres

# Load ONLY the generated JWT secret for the Maven process; do not print it.
$jwtSetting = Get-Content Backend/.env | Where-Object { $_ -match '^JWT_SECRET=' } | Select-Object -First 1
$env:JWT_SECRET = $jwtSetting.Substring('JWT_SECRET='.Length)

Set-Location Backend
mvn spring-boot:run
```

Use a separate terminal for the frontend:

```powershell
Set-Location frontend
npx --yes pnpm@10.11.0 install --frozen-lockfile
npm run dev
```

For Maven development, `.env` is not automatically loaded by Spring Boot. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and any bootstrap variables in that terminal if you change them from the defaults. For example, set `DB_URL` to `jdbc:postgresql://localhost:<your-port>/logistics` if the database host port changes.

Copy `frontend/.env.example` to `frontend/.env.local` when using a different API URL. `VITE_API_URL` is a build/dev-server setting: rebuild/restart after changing it. Docker builds set it to `/api` so browser requests use the same origin.

## Configuration

| Variable | Default / meaning |
|---|---|
| `JWT_SECRET` | Required; at least 32 UTF-8 bytes. No fallback signing secret. Changing it invalidates existing tokens. |
| `JWT_EXPIRATION_MS` | `86400000`; must be positive. |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Maven defaults target local `logistics` with the existing development credentials. Compose supplies its PostgreSQL service address. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins; local defaults are ports 5173 and 4200. Bearer requests do not use credential cookies. |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Compose database initialization and host port settings. |
| `BACKEND_PORT`, `FRONTEND_PORT` | Compose host ports, default 8080 and 5173. |
| `BOOTSTRAP_ADMIN_ENABLED`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` | Opt-in initial administrator provisioning. |
| `DDL_AUTO` | `update` temporarily; Flyway final schema is still pending. |
| `SHOW_SQL`, `SECURITY_LOG_LEVEL` | `false`, `INFO`. |
| `VITE_API_URL` | Frontend setting; defaults to `http://localhost:8080/api`, Docker uses `/api`. |

## Verify the increment

```powershell
Set-Location Backend
mvn clean test

# From the repository root against a running API:
./scripts/Test-LocalApi.ps1
# Use -BaseUrl http://localhost:5173/api to also exercise the Nginx proxy.

# From frontend:
npm run build
```

The Maven tests exercise real MVC, services, JWTs, security filters, Bean Validation, and method authorization with mocked persistence. They also cover JWT configuration and administrator bootstrap. They do not certify JPA mappings or real PostgreSQL transactions. The API smoke script checks health, registration/login/profile, invalid tokens, and client access restrictions; it creates one client account per run and prints no credentials.

Authenticated requests reload account state and roles: disabling a user blocks their existing token on the next request; a role change takes effect on the next request. Re-enabling an account allows a still-valid token again. Missing/invalid credentials return JSON `401`; insufficient roles return JSON `403`. Only health is public under Actuator; other exposed management endpoints require an administrator. Login failures use one generic response.

Full Docker build/startup, PostgreSQL workflows, and the smoke script require a running Docker engine. See [BUILD_HANDOFF.md](BUILD_HANDOFF.md) for what was actually verified in the latest implementation session.

## Planning documents

Repository hygiene: commit source, tests, resources, documentation, dependency lockfiles, and build/deployment configuration. Root `.gitignore` excludes IDE metadata (`.idea/`, `*.iml`), Maven `target/`, old Gradle caches/output, frontend dependencies/bundles, logs, and real environment files. The obsolete Gradle wrapper was removed; Maven is the backend build tool.

Previously tracked generated/IDE files have been removed from the Git index while remaining on disk (except the intentionally deleted Gradle wrapper and its IDE configuration). Their staged deletions are a one-time repository cleanup. Ignoring files does not remove them from earlier commits or stop tracking them retroactively. A new branch inherits the repository's tracked files; it does not generate these artifacts itself. Git commits staged differences, so unchanged tracked source files do not need ignore rules.

- [PRD.md](PRD.md): product behavior, roles, entities, and business rules.
- [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md): ordered milestones and completion checkboxes.
- [REQUIREMENTS_GAP_ANALYSIS.md](REQUIREMENTS_GAP_ANALYSIS.md): coursework coverage and remaining gaps.
- [BUILD_HANDOFF.md](BUILD_HANDOFF.md): resumable implementation record.

Implementation references: [Spring Boot 4 migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide), [Docker Compose readiness dependencies](https://docs.docker.com/compose/how-tos/startup-order/).
