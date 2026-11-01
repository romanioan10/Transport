# TransportApp implementation plan and progress

Baseline: 1 November 2026. Based on [PRD.md](PRD.md), the current source review, and [REQUIREMENTS_GAP_ANALYSIS.md](REQUIREMENTS_GAP_ANALYSIS.md).

**Latest user direction:** foundation configuration only, then stop and continue together for learning. The setup checkpoint below is complete at the configuration level. The full milestone 1 remains incomplete: Docker/PostgreSQL runtime verification and Flyway are still pending. See [BUILD_HANDOFF.md](BUILD_HANDOFF.md).

Use this as the working tracker. Check a task only when its acceptance condition works; add a date, commit, or short evidence note. Existing functionality checked below was found in source, not verified end to end.

**When the user asks to continue:** first run and understand the current application, then choose one small implementation step together. The milestones below are the future roadmap, not a queue to execute automatically.

## Foundation checkpoint — current stopping point

| Foundation item | Result |
|---|---|
| Backend build and security regression suite | Verified: 25 tests pass and the executable JAR packages. |
| Frontend production build | Verified. |
| Environment settings and local-secret initialization | Implemented; initialization verified as idempotent. |
| Backend/frontend container configuration and API proxy | Written; Compose configuration validation passes. |
| Startup, first-admin provisioning, and verification instructions | Documented in README.md. |
| Persistent handoff | BUILD_HANDOFF.md, with a pointer from root AGENTS.md. |
| Docker engine and real database/browser workflows | Not verified: Docker engine is not running. |

No services have been extracted. Schema migrations, messaging, streaming, FaaS, new business features, and micro frontends remain learning work for later. This smaller setup checkpoint does not mean the full product or coursework baseline is finished.

## Recommended service boundaries

**Yes, extract login/registration into an Identity service. Keep account management with it.** A separate service named “Management” would cover too many unrelated responsibilities. Use business responsibilities to name and divide services.

Build three internal services plus a web-facing gateway. This satisfies the intended shape of “more than two internal microservices” without relying on counting the gateway as one of the three.

| Component | Owns | Examples | Initial approach |
|---|---|---|---|
| API gateway / web-facing server | Routing, external API entry point, correlation IDs, broad authentication checks | Route `/api/auth` and `/api/users` to Identity; transport routes to Operations; notification routes to Notifications | Keep business rules in the services. Nginx can sit in front for load balancing. |
| **Identity service** | Credentials, common user identity, role, account status, registration/login, user administration, own-profile updates | Client registration; admin creates driver account; disable account; update name/phone | Extract existing auth/security/user code incrementally. Own the user database and password hashes. |
| **Transport Operations service** | Vehicles, trailers, driver operational profiles, trips/stops, bookings, packages, capacities, assignment schedules, manual payment fields | Publish a trip; reserve seats; approve a package; cancel a trip | Evolve the existing backend into this service. Keep these rules in one transactional boundary initially. |
| **Notifications service** | User notification records, unread/read state, message consumption, authenticated server push | Notify driver of assignment; notify client of confirmed booking; notify users of cancelled trip | Build during the guided service-split phase: it provides a meaningful third service and supports RabbitMQ plus server notifications. |

Each internal service must be an independently runnable application with its own build/configuration and data ownership. Three packages or three `@Service` classes in the same process do not meet that boundary.

### Why keep bookings and packages with trips initially?

The PRD requires strict seat/cargo limits, conflict-free assignments, and cancellation of a trip's bookings and packages. Keeping these records together lets one database transaction enforce those rules. Splitting them immediately would require distributed reservation workflows, compensation, and more failure handling before the first booking works.

Use separate internal modules/packages inside Operations for fleet, scheduling, bookings, and cargo. That gives you clean boundaries for a later extraction without introducing extra network hops now.

### Data ownership and authentication decisions

- Identity owns common `User` data. Operations owns `DriverProfile` and any transport-specific client profile data; link them using user IDs.
- Use IDs across service boundaries, not cross-service JPA relationships or shared table access. Keep JPA relationships within each service's database.
- For local development, one PostgreSQL server can host separate service databases with separate users. Each service owns its migrations and credentials.
- Each service enforces its own role and ownership rules. A valid JWT alone does not prove that a client owns a booking or that a driver is assigned to a trip.
- Decide how existing tokens stop working when users are disabled or roles change. A simple first implementation can validate current account state through an authenticated Identity endpoint, with timeouts and failure behavior documented. This adds a runtime dependency; short-lived JWTs alone do not provide immediate revocation.
- For multi-service JWT verification, prefer an issuer that signs with a private key and services that verify with the public key. Keep private signing material inside Identity. Plan this before copying the current shared-secret configuration into every service.
- Begin new domain entities with UUIDs as requested by the PRD. Plan migration of existing user/vehicle IDs explicitly; preserve existing data and frontend contracts during the transition.

### Proposed structure

```text
TransportApp/
  Backend/                    # evolves into Transport Operations
  services/
    identity-service/
    notification-service/
    audit-service/            # later, when implementing Kafka
  gateway/
  frontend/                   # current app; later host + feature builds
  deployment/                 # eventual complete Compose setup
  docs/                       # API examples, UML, C4, tutorial
```

This is a proposal, not a directory structure already created. Keep existing Compose configuration working while consolidating deployment configuration incrementally.

## Application experience from the PRD

The PRD specifies workflows and pages rather than a detailed visual design. Build an administrator-first interface with simple tables, forms, clear statuses, and visible remaining capacity. Live maps, seat maps, and advanced charts can wait.

| Audience | Main navigation | First complete workflow |
|---|---|---|
| Public | Available trips, trip details, login, registration | Browse a future published trip without seeing private contact or operational details. |
| Administrator | Overview, trips, fleet, drivers/users, bookings, package requests, notifications | Create resources, draft/publish a trip, review bookings, approve packages, inspect remaining seats/volume/weight. |
| Driver | Assigned trips, trip details, notifications | View own trip and relevant contacts; move it from planned to in progress to completed. |
| Client | Search trips, my bookings, my packages, notifications, profile | Book seats or request package transport; view own statuses and cancel where permitted. |

Suggested admin trip detail layout: route and schedule at the top; driver/vehicle/trailer and status beside them; remaining seats, cargo volume, and cargo weight together; then stops, bookings, and packages in separate tabs.

For micro frontends later, use a shell plus independently built **Admin** and **Passenger/Driver portal** frontends. Authentication and navigation belong in the shell; backend role checks remain mandatory.

## Progress overview

| Milestone | Status | Completion evidence |
|---|---|---|
| 0. Existing foundation | Partial | Source contains REST/JWT/RBAC, React API integration, PostgreSQL Compose. |
| 1. Reliable baseline | In progress | 25 Maven tests pass; frontend build and Compose validation pass. Docker runtime, database workflows, and Flyway remain pending. See BUILD_HANDOFF.md. |
| 2. Identity extraction + gateway | Not started | Record independent startup and routed login/profile requests. |
| 3. Notifications + RabbitMQ | Not started | Record assignment event producing a stored and pushed notification. |
| 4. PRD fleet and trip model | Not started | Record published trip and rejected invalid/conflicting assignments. |
| 5. Bookings and packages | Not started | Record successful workflows and capacity/concurrency tests. |
| 6. Complete user interfaces | Not started | Record admin, driver, and client demonstrations. |
| 7. Remaining coursework integrations | Not started | Record balancing, Kafka, FaaS, and micro frontend evidence. |
| 8. Submission documentation | Not started | Record clean-checkout demo, diagrams, tutorial, public commit/tag. |

### Milestone 0 — Existing foundation

- [x] Spring Boot REST backend with persistence and DTOs exists.
- [x] Login/registration, BCrypt, JWT filter, and method-level roles exist.
- [x] User, vehicle, and basic assignment management exist.
- [x] React frontend consumes the REST API.
- [x] PostgreSQL is configured in Docker Compose.
- [x] Swagger/OpenAPI dependencies and settings exist.

These checks do not mean the full related coursework points are complete. Consult the gap analysis for limitations.

### Milestone 1 — Make the current baseline reliable

- [x] Document the actual Maven build, Java version, database startup, backend startup, and frontend startup commands. See README.md; Maven Java 21 and frontend builds verified on 1 November 2026.
- [ ] Verify registration, login, own profile, admin user/vehicle management, and driver assignment end to end.
- [x] Reject existing tokens for disabled accounts; verify role changes take effect according to the documented policy. Real MVC/security tests use the same token before/after status and role changes.
- [x] Align JWT auth-path handling with the `/api` context path and require a deployment signing secret. Removed the fallback secret and added validation/tests.
- [x] Add security integration tests for anonymous, wrong-role, valid, expired, and disabled-account access. 19 security integration tests plus 6 JWT/bootstrap unit tests pass.
- [x] Document safe initial administrator provisioning; public registration remains client-only. Opt-in bootstrap and regression tests implemented; real database startup remains pending.
- [ ] Introduce Flyway with a migration/baseline strategy for the existing database; use Hibernate schema validation once migrations are authoritative.
- [ ] Containerize the current backend and frontend, preserving the existing PostgreSQL setup. Dockerfiles, proxy, and full Compose configuration are written and configuration validation passes; image build/startup still need a running Docker daemon.
- [x] Move frontend API URL and database settings to environment-specific configuration. Frontend build and Compose configuration validation pass; CORS policy is configurable and tested.

**Done when:** a clean checkout starts using documented commands and the current user/vehicle/assignment workflow passes verification. Do this before moving working authentication between processes.

### Milestone 2 — Extract Identity and introduce the gateway

- [ ] Write a short architecture decision covering ownership, route mappings, user IDs, token verification, and account revocation.
- [ ] Create an independently runnable Identity application with its own database migrations.
- [ ] Move registration/login, user administration, common profile handling, credentials, roles, and statuses to Identity.
- [ ] Preserve `/api/auth/...` and `/api/users/...` externally through gateway routing.
- [ ] Keep transport-specific driver status and scheduling in Operations; define a secured account lookup contract.
- [ ] Replace Operations' direct access to Identity tables with an explicit API/contract.
- [ ] Add timeout and unavailable-service behavior for Identity-dependent operations.
- [ ] Verify valid/invalid tokens and role/ownership rules directly against each exposed service boundary.
- [ ] Extend Compose to start the gateway, Identity, Operations, and their databases.

**Done when:** frontend login still works through the gateway, Identity and Operations run independently, and neither reads the other's tables.

### Milestone 3 — Deliver the third service with a real workflow

- [ ] Create Notifications with its own database and migrations.
- [ ] Add RabbitMQ and a versioned notification message contract with event ID, recipient ID, type, timestamp, and related entity ID.
- [ ] After a successful driver assignment, record a notification job using a transactional outbox in Operations.
- [ ] Publish outbox entries to RabbitMQ with retry handling; mark published only after broker confirmation.
- [ ] Consume idempotently in Notifications; save before acknowledgement; configure retries and a dead-letter queue.
- [ ] Provide recipient-scoped notification list and mark-read endpoints.
- [ ] Add authenticated SSE or WebSocket delivery, plus reconnect and catch-up from stored notifications.
- [ ] Add an unread indicator and notification list in the existing React app.
- [ ] Prove one user's notification cannot be read or received by another user.
- [ ] Stop/restart the consumer and verify queued notifications survive and are not duplicated in storage.

**Done when:** an admin assigns a vehicle and the logged-in driver receives a stored notification without refreshing. You now have three useful internal services, broker communication, and server push.

For browser SSE, choose an authentication mechanism deliberately: native `EventSource` cannot set a custom Bearer header. Use a compatible authenticated streaming client or a carefully configured cookie-based approach; avoid putting long-lived JWTs in URLs.

### Milestone 4 — Implement fleet and trips from the PRD

- [ ] Add vehicle statuses and passenger/cargo capacities; add trailer management.
- [ ] Add driver operational profiles separate from account status.
- [ ] Add UUID domain IDs and created/updated timestamps with documented migration compatibility.
- [ ] Add trip, ordered stops, copy-per-use locations, schedule, resource references, and capacity snapshots.
- [ ] Implement draft/publish validation: route, schedule, active resources, and complete capacity data.
- [ ] Enforce driver/vehicle/trailer schedule conflicts, including concurrent assignment attempts.
- [ ] Add public sanitized available-trip endpoints and assigned-driver views.
- [ ] Enforce permitted status transitions and assigned-driver ownership.
- [ ] Evolve direct driver/vehicle assignment into trip-based assignment; retire the legacy workflow only once its replacement works.

**Done when:** an admin can publish a real trip and invalid schedules/resources are rejected. A driver can see and update only their assigned trips.

### Milestone 5 — Implement bookings, packages, and capacity

- [ ] Confirm bookings only when enough seats remain; validate ordered pickup/drop-off stops.
- [ ] Cancel own confirmed bookings and release seats.
- [ ] Add package items with positive dimensions/weight/quantity and server-calculated totals.
- [ ] Add pending/approved/rejected/cancelled package lifecycle and ownership rules.
- [ ] Atomically approve only when both remaining cargo volume and weight permit it.
- [ ] Lock vehicle/trailer assignment and capacity snapshots once confirmed/approved capacity is in use.
- [ ] Cancel active bookings/packages transactionally when a trip is cancelled; enqueue affected-user notifications.
- [ ] Keep manual amount/currency and paid/unpaid fields on bookings/packages as specified by the PRD.
- [ ] Add the PRD's mandatory service/integration tests, including concurrent requests for the last seat and last available cargo capacity.

**Done when:** booking and package workflows work and simultaneous requests cannot overbook seats, volume, or weight.

### Milestone 6 — Complete the role-specific interfaces

- [ ] Public available-trip list and details.
- [ ] Admin fleet, trailers, driver/user management, trip creation/publishing, and trip details.
- [ ] Admin bookings list and package approval queue with visible remaining capacities.
- [ ] Client booking/package forms, own lists, cancellation actions, and profile.
- [ ] Driver assigned-trip list/details and permitted status changes.
- [ ] Stored/pushed notifications for each audience, with read/unread state.
- [ ] Loading, empty, validation, forbidden, and service-unavailable states for the main workflows.

**Done when:** the administrator-first workflow and supporting driver/client journeys in the PRD are usable end to end.

### Milestone 7 — Complete the remaining grade S requirements

- [ ] **Load balancing:** run two Operations replicas behind Nginx and demonstrate traffic reaching both. Verify transactional rules still hold across replicas.
- [ ] **Notification scaling if replicated:** ensure messages reach the instance with the recipient's active connection; separate per-user delivery from queue work distribution.
- [ ] **Kafka:** publish committed booking/package/trip domain events through an outbox and consume them in an Audit/Reporting service with idempotent projections and replay. RabbitMQ remains responsible for notification jobs.
- [ ] **FaaS:** deploy and invoke a stateless package measurement function using dimensions, per-item weight, and quantity. Validate its output in Operations; capacity reservation remains an Operations transaction. Document timeout/failure behavior.
- [ ] **Micro frontends:** create a host shell and at least two independently built feature frontends; demonstrate one can be rebuilt/deployed separately.
- [ ] Add all required runtime services to documented Compose deployment with health checks and environment settings.

**Done when:** each integration performs a real application task and has a reproducible demonstration. Running infrastructure containers alone does not complete the requirement.

### Milestone 8 — Documentation and tutorial

- [ ] Keep OpenAPI examples current for each service and the external API routes.
- [ ] Add C4 system context and container diagrams showing services, databases, gateway, frontend composition, RabbitMQ, Kafka, and FaaS.
- [ ] Add UML domain/class and sequence diagrams for booking, package approval, and notification delivery.
- [ ] Write the approximately three-page tutorial; JWT security is the closest topic to existing implementation.
- [ ] Link a public repository commit/tag and verify anonymous access to the working example.
- [ ] Run the entire demo from a clean checkout using the written instructions.
- [ ] Update the gap analysis and record evidence for every coursework requirement.

## Examples of additional services later

| Candidate | Useful example | Recommendation |
|---|---|---|
| **Audit / Reporting** | Consume Kafka events and build booking counts, trip history, and package decision history | Best fourth service when adding Kafka; reporting failure must not block bookings. Limit personal data in events. |
| **Tracking** | Receive driver GPS updates and distribute live positions | Only after the MVP; explicitly future scope in the PRD. |
| **Documents** | Generate booking confirmations, manifests, or invoices asynchronously | Useful later; some document generation can instead be a FaaS task. |
| **Payments** | Integrate payment provider, retries, refunds, and payment events | Only when online payments are introduced. Current manual payment fields stay in Operations. |
| **Pricing / Quotes** | Calculate versioned quotes based on route, seats, package size, and tariffs | Only when automated pricing exists; the PRD currently uses administrator-entered prices. |
| **Bookings / Cargo** | Separate passenger reservations or package workflows at larger scale | Later extraction only after defining authoritative capacity ownership and distributed cancellation/reservation behavior. |

Do not create an empty “future service.” Notifications is already justified by the PRD and coursework; Audit/Reporting has a concrete purpose once Kafka is added.

## PRD alignment to record before implementation

Preserve the product rules in the PRD, and record these coursework architecture additions in a short architecture decision or a later PRD update:

- Three internal services plus a gateway replace the single-application deployment assumption; each service still uses the PRD's layered design internally.
- Stored notifications remain required, with asynchronous broker processing and server push added for coursework. Notification delivery becomes eventually consistent rather than synchronous with the business transaction.
- Full frontend containerization and micro frontends extend the PRD's small React app/deployment scope.
- Kafka audit projections and the FaaS calculation are explicit coursework integrations.

This tracker proposes those decisions; it does not change the PRD or implement the services. Update progress as working increments land, rather than marking future architecture as completed.
