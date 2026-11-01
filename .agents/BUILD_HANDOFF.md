# Build handoff: resume here

Updated: 1 November 2026, after the user's scope change. **Foundation configuration complete; stop here and wait for the user to continue.** The larger milestone 1 remains incomplete.

## Latest user direction — overrides the earlier autonomous roadmap

Follow-up repository cleanup is authorized: use Maven only, remove the obsolete Gradle wrapper, ignore generated/IDE/local files, and remove already-tracked generated/IDE files from the Git index without deleting local settings/build output. This does not resume feature development or service extraction.

The user wants only a good configured base now, so they can learn while building the remaining system. Do not proceed automatically into migrations, service extraction, new product features, or coursework integrations. Continue in small explained steps when the user asks to resume. Earlier autonomous-build authorization has been narrowed by this instruction.

The base has configurable runtime settings, tested authentication, initial-admin provisioning, container configuration, local setup/smoke scripts, and startup documentation. No internal microservices have been extracted. Docker was checked again after the scope change and its daemon pipe is still unavailable; no images, database workflows, or browser workflows were certified.

## Instructions for the next session

Read this file, `IMPLEMENTATION_PROGRESS.md`, `PRD.md`, `REQUIREMENTS_GAP_ANALYSIS.md`, and applicable `AGENTS.md`/skills before changing code. Recheck Git status: this workspace already contains user changes and tracked build output. Do not reset or delete those changes. No commit/push is authorized by this log.

The user originally authorized autonomous implementation, then narrowed the request to foundation setup followed by guided learning. The intended future architecture remains Identity + Transport Operations + Notifications behind a gateway; later Audit/Reporting consumes Kafka. Keep trips/bookings/packages together initially for transactional capacity enforcement.

## Plan review before implementation

Applied `Backend/.agents/skills/grill-me/SKILL.md`: resolve questions from source/context where possible. The agreed plan already selects backend-first incremental work; no new design question blocks baseline security fixes.

Critique and resulting adjustments:

- Extracting Identity immediately would copy untested authentication and existing coupling. First verify security with a real filter chain and mocked persistence; preserve external routes.
- Default Java is 17, while Maven targets Java 21. Locate/use a compatible installed JDK before treating build errors as code failures.
- The catch-all controller exception handler may turn authorization failures into HTTP 500. Cover method authorization as well as filter authentication.
- Two CORS configurations overlap. Consolidate into one configurable policy while preserving local frontend origins.
- Changing schema management before inspecting the existing database risks an invalid baseline. Defer Flyway migration until current schema/data and migration compatibility can be verified; do not claim milestone 1 complete without it.
- Keep deployment changes compatible with the existing Compose database and persistent volume. Do not delete volumes or change IDs destructively.

## Original setup sequence — completed to the configuration checkpoint

1. Inspect toolchain and run baseline checks.
2. Fix account-status/token handling, auth path matching, predictable 401/403 errors, and configuration; add meaningful regression tests using existing test dependencies.
3. Add environment-driven API/database/CORS settings and container startup configuration; document administrator provisioning.
4. Run required Maven checks and frontend build, inspect diff, and update this log and the progress checklist with exact results.
5. Stop at the user's requested setup checkpoint. Remaining milestone 1 work and extraction require a follow-up learning session.

## Completed this session

- Read repository Markdown instructions, PRD, gap analysis, tracker, frontend README, and local planning skill.
- Inspected backend security, business services, entities, repositories, runtime configuration, and frontend API configuration.
- Created this handoff before implementation so an interruption leaves a clear next step.

## In progress / verification

- Security increment implemented: live account status/roles on JWT requests, context-path exemption, JSON 401/403 responses, generic login errors, duplicate registration check, one configurable CORS policy, required JWT secret, environment-based settings, and opt-in admin bootstrap.
- Added 25 passing tests (19 real MVC/security/service integration tests with mocked repositories, 2 JWT unit tests, 4 admin-bootstrap unit tests). Final `mvn clean test` passed on 1 November 2026 at 18:22 local time. No new dependencies.
- Final frontend `npm run build` passed after the configuration changes. The executable backend JAR was also packaged successfully using `mvn package -DskipTests` after the passing test run (18:38 local time).
- Maven already uses Corretto Java 21 through its launcher even though `java` on PATH is 17. Use `mvn -version` to verify the effective build JDK.
- Added backend/frontend Dockerfiles and dockerignore files, Nginx API proxy/SPA fallback, environment examples, backend/database/frontend health dependencies, and full-stack Compose configuration. Preserved the user's volume rename. `docker compose -f Backend/docker-compose.yml config --quiet` passed with a temporary non-deployment test secret (Docker emits a local config access warning).
- Added `scripts/Initialize-LocalEnvironment.ps1` (generate an ignored local secret without overwriting existing settings) and `scripts/Test-LocalApi.ps1` (live smoke checks; creates one test client).
- Replaced placeholder root README with startup, configuration, first-admin provisioning, and verification instructions. Added root ignores for local credentials and generated output; already tracked artifacts are unaffected by ignore rules.
- Environment initialization ran successfully twice; a hash comparison confirmed it does not change an already initialized file. `Backend/.env` now exists with a generated local secret and is confirmed ignored by Git. Do not print it. The live smoke script parses successfully but has not been run against an API.
- Docker CLI is installed but the daemon pipe is absent. Images, health checks, Nginx proxy, PostgreSQL workflows, and live smoke script have NOT run.
- Added root `AGENTS.md` to direct future sessions to this handoff. Updated tracker checkboxes and the gap analysis, and corrected obsolete implementation notes in the PRD without changing its product requirements.
- No separate filesystem memory directory was found; conversation context and repository Markdown are the working context. Do not read credential stores or unrelated session databases.

## Known pre-existing workspace changes

IDE files, Gradle caches/reports, Maven target artifacts, and `Backend/docker-compose.yml` were already modified. `IMPLEMENTATION_PROGRESS.md` and `REQUIREMENTS_GAP_ANALYSIS.md` already existed as untracked files. Preserve existing Compose database/volume choices.

Maven verification originally regenerated tracked `Backend/target` outputs. The later user-authorized cleanup below removes these from the index. Preserve the staged cleanup deletions and the user's other index/staging state. No commit or push was made.

### Maven-only repository cleanup (follow-up)

- Plan: expand root ignore rules; remove `Backend/gradle` and the obsolete `.idea/gradle.xml`; untrack `.idea`, `Backend.iml`, `Backend/.gradle`, `Backend/build`, and `Backend/target` while keeping their remaining local contents.
- Review adjustment: ignore rules alone do not affect tracked files. One-time staged deletions are required to remove those artifacts from future commits. Preserve existing staged changes and never stage application edits with a blanket `git add`.
- Keep source resources, documentation, Maven/Docker/Vite configuration, and package lockfiles trackable; “not code” does not mean discarding the files needed to build or explain the application.
- Completed: root `.gitignore` now covers nested Maven/Gradle/frontend output, IDE metadata/module files, logs, local env files (examples remain trackable), and temporary files. Removed the obsolete `Backend/gradle` wrapper directory and `.idea/gradle.xml` from disk.
- Completed: removed `.idea`, `Backend.iml`, `Backend/.gradle`, `Backend/build`, `Backend/target`, and the wrapper from the Git index. Remaining IDE settings and build/cache output were preserved on disk. The resulting staged deletions are intentional one-time cleanup; do not restore them automatically. No application edits were staged by this cleanup and no commit/push was made.
- Verified: no generated/IDE/Gradle entries remain tracked; no currently tracked files match the ignore rules; representative local generated files and secrets are ignored; local IDE/build files and the Maven POM still exist.
- Updated backend instructions to Maven-only and documented the cleanup in README/PRD. Application behavior did not change; no new tests were needed for ignore rules or removal of unused tooling.

## Files changed in this increment

- Security/configuration: `CustomUserDetailsService`, `JwtAuthenticationFilter`, `JwtService`, `SecurityConfig`, new `SecurityErrorHandler`, `GlobalExceptionHandler`, `AuthService`, `CorsConfig`, `application.properties`. Removed duplicate `WebConfig` after consolidating CORS.
- Admin provisioning: new `Backend/src/main/java/org/transport/config/AdminBootstrap.java`.
- Tests: `RestSecurityIntegrationTest`, `JwtServiceTest`, `AdminBootstrapTest` under `Backend/src/test/java/org/transport`.
- Deployment: both Dockerfiles/dockerignore files, environment examples, `frontend/nginx.conf`, existing Compose file, root `.gitignore`.
- Frontend: configurable `VITE_API_URL` in `src/api/client.ts`; pinned package manager in `package.json`.
- Scripts: environment initialization and live API smoke check under `scripts/`.
- Documentation: root AGENTS/README/handoff, tracker, gap analysis, and PRD implementation-alignment notes.

## Next learning session — only after the user asks to continue

1. Explain the current request flow using the README learning map. Keep the first session focused on running the existing system and tracing login/profile requests.
2. Check Docker Desktop's Linux engine and use README startup/admin instructions. Build/start the configured stack and inspect health/logs together. Preserve the existing volume/project name and never print local secrets.
3. Explain and run the smoke checks, including through the frontend proxy. The script creates a test client; explain that database side effect first. Verify admin/driver workflows separately.
4. Agree one next small implementation exercise. A suitable foundation topic is Flyway: inspect/back up the actual schema, explain migrations versus Hibernate update, and verify compatibility before adopting migrations.
5. Later, discuss Identity extraction and its dependencies before changing service boundaries. Implement and explain one piece at a time instead of building the whole roadmap autonomously.

## Verification limits and follow-up observations

- Current security checks use mocked repositories, not a PostgreSQL server or a complete browser workflow. No claim of runtime verification for Docker or migrations.
- The first package attempt was blocked by sandbox dependency-cache/network access; the allowed retry succeeded. This was an environment failure, not a source/build failure.
- Maven reports a pre-existing `Vehicle` builder-default warning and test-only JJWT deprecation/unchecked and Mockito agent warnings. They did not fail checks; avoid unrelated cleanup while extracting services.
- Registration checks for an existing email before saving; concurrent duplicate requests still rely on the database unique constraint and do not yet have a dedicated conflict-mapping regression test.
- The PRD's restriction on administrators editing client personal details and its history-preserving deletion rules still require a separate product-behavior pass. This increment did not rewrite user/assignment business behavior.

## Still not implemented

Flyway final schema, service extraction/gateway, RabbitMQ/Notifications, PRD trips/bookings/packages, Kafka, FaaS, load balancing, micro frontends, UML/C4, tutorial. See the main tracker for acceptance criteria.
