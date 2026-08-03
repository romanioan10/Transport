# Transport Management Platform PRD

## 1. Product Summary

The Transport Management Platform is a backend-first transport management system for a small business operating vans, drivers, passengers, packages, and trailers. The first finished version focuses on the administrator's ability to manage trips, vehicles, trailers, drivers, passenger bookings, package requests, and available capacity.

The system is inspired by a family transport business that mainly operates routes between Romania and Italy, but it must support routes in other countries as well.

This project is intended as a dissertation-ready full-stack application that demonstrates Java backend development, REST API design, ORM-based persistence, role-based authentication, Docker deployment, and a realistic business database model.

## 2. MVP Decision

The first finished version will not attempt to implement the full commercial product. The MVP is:

- A Spring Boot backend with REST APIs.
- PostgreSQL persistence using Spring Data JPA and Hibernate.
- JWT-based authentication and role-based authorization.
- A small web interface for administrator, driver, and client workflows.
- Docker Compose for local development.
- Swagger/OpenAPI documentation.
- Core workflows for trips, vehicles, trailers, bookings, package requests, and capacity calculation.

The following features are considered optional extensions after the MVP is stable:

- Native or cross-platform mobile application.
- Live GPS tracking.
- Route optimization through Maps APIs.
- Nearby client/package request detection.
- Advanced real-time notifications.
- Payments.
- Fully automated pricing engine.

## 3. Primary User

The primary user for version 1 is the Administrator / Transport Manager.

The MVP should optimize for the administrator being able to manage the business:

- Create and manage trips.
- Assign drivers, vehicles, and trailers.
- View passenger bookings.
- Review package requests.
- Monitor remaining passenger and cargo capacity.
- Manage vehicles, trailers, drivers, and clients.

Driver and client features are still required, but they are supporting workflows rather than the main product surface.

## 4. User Roles

### Administrator / Transport Manager

The administrator manages the transport operation. This role can:

- Manage users, drivers, vehicles, and trailers.
- List clients, view client details, and enable or disable client accounts.
- Create, update, and cancel trips.
- Assign drivers, vehicles, and optional trailers to trips.
- View passenger bookings.
- Approve or reject package requests.
- View remaining seats and cargo capacity.
- View basic operational notifications.

### Driver

The driver has a limited account focused on assigned work. This role can:

- View assigned trips.
- View trip stops and booking/package information relevant to the trip.
- View client contact information only for bookings and package requests attached to assigned trips.
- Update trip status.
- See remaining passenger and cargo capacity.

Live GPS sharing is not mandatory in version 1.

### Client

The client can:

- Create an account and log in.
- View available trips.
- Book passenger seats.
- Submit package transport requests.
- View the status of their bookings and package requests.
- View limited driver contact information only after a booking is confirmed or a package request is approved.
- Update their own name and phone number.

Real-time vehicle tracking is not mandatory in version 1.

## 5. MVP Functional Requirements

### Authentication and Authorization

The system must support:

- User registration.
- User login.
- JWT authentication.
- Role-based access control for `ADMIN`, `DRIVER`, and `CLIENT`.
- Protected endpoints based on user role.
- Basic user account statuses.
- Exactly one role per user.

Version 1 user statuses:

- `ACTIVE`
- `DISABLED`

Disabled users cannot log in.

Client accounts may be created through public self-registration. Driver accounts should be created or promoted by administrators. Administrator accounts should be seeded or created manually, not through public registration.

Authentication endpoints should be consolidated under `AuthController`. User management endpoints should not duplicate login or registration behavior.

Public registration must always create a `CLIENT` account. The public registration request must not allow users to choose `ADMIN` or `DRIVER` roles.

Version 1 should use exactly one role per user: `ADMIN`, `DRIVER`, or `CLIENT`. Multi-role users and fine-grained authorities are future scope.

Common authentication and identity fields should live on `User`. Role-specific information should live in separate profile entities such as `DriverProfile` and `ClientProfile`.

Suggested `User` fields:

- Email.
- Password hash.
- Full name.
- Phone number.
- Role.
- Status.

### Vehicle Management

The administrator must be able to create, view, update, and delete vehicles.

Each vehicle should store:

- Registration number.
- Passenger capacity.
- Cargo volume capacity.
- Maximum weight.
- Status.

Suggested vehicle statuses:

- `ACTIVE`
- `INACTIVE`
- `MAINTENANCE`

### Trailer Management

The administrator must be able to manage trailers separately from vehicles.

Each trailer should store:

- Identifier or registration number.
- Volume capacity.
- Maximum weight.
- Status.

Suggested trailer statuses:

- `ACTIVE`
- `INACTIVE`
- `MAINTENANCE`

A trip may have no trailer or one assigned trailer.

### Driver Management

The administrator must be able to:

- Create or manage driver accounts.
- View driver details.
- Update driver name and phone number.
- Update driver operational status.
- Disable driver user accounts.
- View driver assigned trips.
- Assign drivers to trips.

Driver accounts should use both user account status and driver operational status. `User.status` controls login access. `DriverProfile.status` controls whether the driver can be assigned to trips.

Version 1 driver profile statuses:

- `ACTIVE`
- `INACTIVE`

For version 1, administrators create driver accounts with a temporary password. Full invitation and password reset flows are future enhancements.

Password reset is out of scope for the MVP. Administrators may manually reset driver temporary passwords if needed.

Clients may update their own first name, last name, and phone number in version 1. Client email and password changes are future scope.

Administrators may list clients, view client details, enable or disable client accounts, and view related bookings/package requests. Administrators should not edit client personal details in version 1.

Administrators may edit driver operational/profile details in version 1, including driver name, phone number, operational status, account status, and temporary password reset.

### Trip Management

In version 1, a `Trip` represents one scheduled journey with a specific departure date and assigned resources. It is not a reusable route template.

The administrator must be able to create trips with:

- Ordered predefined stops, including origin, intermediate stops, and destination.
- Departure date and time.
- Optional estimated arrival date and time.
- Assigned driver.
- Assigned vehicle.
- Optional assigned trailer.
- Initial trip status.

Trip stops should have an explicit order and type.

Suggested trip stop fields:

- Stop order.
- Location.
- Stop type.

Suggested stop types:

- `ORIGIN`
- `INTERMEDIATE`
- `DESTINATION`

Trip stops are the source of truth for a trip's origin and destination. A trip must have exactly one `ORIGIN` stop and exactly one `DESTINATION` stop. API DTOs may expose origin and destination as derived fields for convenience.

Trips must support Romania-Italy and Italy-Romania routes, but locations must not be hardcoded to only those countries.

Trip origins, destinations, and stops should use structured `Location` records. Map coordinates are optional in version 1.

Location fields should include:

- Country.
- City.
- Address line.
- Optional label.
- Optional latitude.
- Optional longitude.

Locations should be copy-per-use records in version 1, not globally deduplicated shared records. Editing one trip, stop, booking, or package location should not silently change another record.

Version 1 supports exactly one assigned driver per trip. Multiple-driver trips are out of scope for the MVP.

Version 1 supports exactly one assigned vehicle per trip and zero or one assigned trailer. Multiple-vehicle or convoy-style trips are out of scope for the MVP.

When a trip is created, the system should store capacity snapshots on the trip. The trip should keep references to the assigned vehicle and trailer, but passenger and cargo calculations should use the trip snapshot fields so later edits to vehicle or trailer records do not silently change existing trips.

Trip capacity snapshot fields should include:

- Passenger capacity.
- Cargo volume capacity.
- Cargo weight capacity.

Vehicles store total passenger and cargo capacity only. Available seats and remaining cargo capacity are calculated from trip capacity snapshots and confirmed/approved records, not stored directly on vehicles.

Vehicle, trailer, and trip cargo weight capacity fields represent usable cargo weight capacity only. They do not model empty vehicle weight, gross vehicle weight, or legal engineering limits in version 1.

Version 1 should not support manual overbooking or overcapacity overrides. Seat, cargo volume, and cargo weight limits must be enforced strictly.

Vehicle and trailer assignment changes should be allowed only while the trip is still `PLANNED` and has no confirmed passenger bookings or approved package requests. Once capacity is in use, vehicle/trailer assignments and capacity snapshot fields are locked.

Driver, vehicle, and trailer availability should be enforced through status checks and trip-overlap checks. A driver, vehicle, or trailer can be assigned only if it is operationally `ACTIVE` and not already assigned to another `PLANNED` or `IN_PROGRESS` trip with an overlapping schedule.

A trip may be drafted without an estimated arrival date and time, but it must have both `departureDateTime` and `estimatedArrivalDateTime` before vehicle/trailer assignment or public availability. The estimated arrival date and time must be after the departure date and time.

If reusable route definitions are needed later, they should be introduced as a separate future entity such as `RouteTemplate`.

Available trips may be publicly visible without login using a limited read-only API. Booking seats, submitting package requests, and viewing sensitive operational details require authentication. Public trip browsing must not expose driver phone numbers, client phone numbers, passenger lists, or package details.

A trip is available to clients when it is `PLANNED` and has a future departure date. Passenger booking additionally requires remaining seats. Package requests may be submitted for available trips and remain subject to administrator approval.

### Passenger Booking

Clients must be able to book passenger seats on available trips.

Version 1 decision:

- Passenger bookings are automatically confirmed if enough seats are available.
- Confirmed bookings immediately reserve seat capacity.
- A passenger booking can reserve one or more seats using a `seatCount` field.
- Clients choose pickup and drop-off from predefined trip stops.
- Clients may book between any two stops on the same trip, as long as pickup comes before drop-off.
- The pickup stop must come before the drop-off stop in the trip stop order.
- The system must prevent overbooking seats.

The administrator and driver should be able to view confirmed passenger bookings for a trip.

Exact seat selection is out of scope for version 1. A future version may add a van seat layout view where clients select specific available seats by clicking on them.

Version 1 should store the client account as the main booking contact. A booking may include optional notes, but it should not create separate passenger records for every reserved seat. Detailed passenger records can be added later if needed.

Clients may cancel their own confirmed passenger bookings. Cancelled passenger bookings release the reserved seats.

Seat capacity is calculated globally for the whole trip in version 1, not per route segment. A confirmed booking consumes its `seatCount` for the entire trip.

Version 1 passenger booking statuses:

- `CONFIRMED`
- `CANCELLED`

Only `CONFIRMED` bookings consume seat capacity.

Passenger check-in, picked-up, dropped-off, and no-show tracking are out of scope for version 1.

Passenger bookings consume seat capacity only in version 1. Passenger luggage is not modeled separately. Extra luggage can be handled manually or submitted as a package request.

### Package Requests

Clients must be able to submit package transport requests.

Version 1 decision:

- Package requests are submitted for a specific trip.
- Package requests require administrator approval.
- Package requests start with status `PENDING`.
- The administrator can mark requests as `APPROVED` or `REJECTED`.
- Cargo capacity is reserved only for `APPROVED` package requests.
- Clients may cancel their own `PENDING` package requests.
- Approved package requests require administrator cancellation.

Each package request should include:

- Pickup location.
- Delivery location.
- One or more package items.
- Optional notes.

Package pickup and delivery should use structured `Location` records. Automatic geocoding and route optimization are optional extensions.

Each package item must include length, width, height, per-item weight, and quantity. Package item dimensions, per-item weight, and quantity are required in version 1. Length, width, height, and per-item weight must be positive values. Quantity must be a positive integer and should default to 1. Package item volume is calculated by the backend and must not be trusted from client input. Each package item may include an optional description.

A package request may contain multiple package items. The request's total cargo usage is calculated as the sum of all item volumes and weights.

All package items inside one package request share the same pickup location and delivery location. If items require different pickup or delivery locations, they should be submitted as separate package requests.

Package request approval is all-or-nothing in version 1. The administrator approves or rejects the entire request, not individual package items.

Unassigned package requests that the administrator later matches to a suitable trip are out of scope for version 1.

Version 1 package request statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

Only `APPROVED` package requests consume cargo volume and cargo weight capacity.

Package-level pickup and delivery progress tracking is out of scope for version 1. The package request lifecycle only covers whether the request is accepted for the trip.

### Cargo Capacity Calculation

The system must calculate package volume using:

```text
volumeCm3 = lengthCm * widthCm * heightCm
```

For package items with quantity greater than 1:

```text
itemTotalVolumeCm3 = lengthCm * widthCm * heightCm * quantity
itemTotalWeightKg = weightKg * quantity
```

The total available cargo capacity for a trip is:

```text
trip cargo volume capacity - approved package volume
```

Cargo capacity is calculated globally for the whole trip in version 1, not per route segment. An approved package consumes its volume and weight for the entire trip.

The system must expose remaining cargo capacity to administrators and drivers.

The system must prevent approval of a package request if it would exceed available cargo capacity or maximum weight.

Package approval must check both remaining cargo volume and remaining usable cargo weight.

The MVP must use consistent measurement units:

- Package dimensions are stored in centimeters.
- Package volume is stored in cubic centimeters.
- Weight is stored in kilograms.
- UI views may display cubic meters by converting `volumeCm3 / 1_000_000`.

### Trip Status Management

The system should support basic trip statuses such as:

- `DRAFT`
- `PLANNED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Drivers should be able to update the status of their assigned trips where appropriate.

Trip status meaning:

- `DRAFT`: incomplete or unpublished trip, not visible publicly.
- `PLANNED`: published scheduled trip, visible publicly if departure is in the future.
- `IN_PROGRESS`: active trip, closed to new bookings and package requests.
- `COMPLETED`: finished historical trip.
- `CANCELLED`: cancelled trip.

To move a trip from `DRAFT` to `PLANNED`, the trip must have:

- Exactly one `ORIGIN` stop.
- Exactly one `DESTINATION` stop.
- Valid ordered stops.
- Departure date and time.
- Estimated arrival date and time after departure.
- Assigned active driver.
- Assigned active vehicle.
- Capacity snapshots.
- No driver, vehicle, or trailer schedule conflicts.

Trip status transition permissions:

- Administrators can manage all trip status transitions.
- Assigned drivers can move their own assigned trips from `PLANNED` to `IN_PROGRESS`.
- Assigned drivers can move their own assigned trips from `IN_PROGRESS` to `COMPLETED`.
- Clients cannot change trip status.

When an administrator cancels a trip, all active passenger bookings and pending or approved package requests attached to the trip should also be cancelled. Affected clients and the assigned driver should receive stored notifications.

### Basic Notifications

The MVP should support basic stored notifications in the database.

Notifications should be stored records with read/unread state.

Suggested notification fields:

- Recipient user.
- Type.
- Title.
- Message.
- Read flag.
- Created date.
- Optional related entity type.
- Optional related entity ID.

Events that may create notifications:

- Passenger booking confirmed.
- Passenger booking cancelled.
- Package request created.
- Package request approved or rejected.
- Package request cancelled.
- Trip status changed.
- Trip cancelled.

Real-time delivery through WebSockets is optional after the core backend is stable.

In version 1, notifications should be created synchronously inside service-layer business operations after successful state changes. Event-driven and asynchronous notification delivery are future enhancements.

WebSockets are not required for MVP completion. The MVP should expose REST endpoints for listing notifications and marking them as read. If time remains, WebSockets may be added only to push newly created notifications to connected users.

### Manual Price and Payment Tracking

Version 1 should not process online payments. The system may store manually managed price and payment information for bookings and package requests.

Supported MVP behavior:

- Administrator can set or edit a price amount.
- Prices are manually entered by the administrator.
- Booking and package request records may store a price amount.
- Passenger booking price is one total price for the whole booking, not per seat.
- Package request price is one total price for the whole request, not per package item.
- Payment status is tracked manually.
- Clients can view the price after it has been set.
- Price amounts should use `BigDecimal`, not floating-point types.
- Currency should be stored explicitly and default to `EUR`.

Suggested payment statuses:

- `UNPAID`
- `PAID`

Payment status, price amount, and currency should be stored directly on `Booking` and `PackageRequest` in version 1. A separate `Payment` entity is not required until online payments, multiple payments, refunds, or invoices are introduced.

Cancellation is represented by booking or package request status, not by payment status.

## 6. Out of Scope for MVP

The following are explicitly out of scope for the first finished version:

- Live GPS tracking.
- Client-side vehicle map tracking.
- Automated route optimization.
- Nearby request matching.
- Mobile application.
- Payment processing.
- Online payment processing.
- Complex automated pricing rules.
- Real-time WebSocket notification delivery.
- Phone calling inside the application.
- Self-service password reset.
- Package photo upload/storage.

These features can be documented as future work or implemented as optional extensions if time remains.

## 7. Technical Requirements

### Backend

The backend must use:

- Java.
- Spring Boot.
- Spring Web.
- Spring Security.
- Spring Data JPA.
- Hibernate ORM.
- PostgreSQL.
- JWT authentication.
- Swagger/OpenAPI.
- Docker.
- Flyway database migrations for the final schema.

Hibernate schema auto-update may be used temporarily during early development, but the dissertation-ready version should use migration files and a validation-oriented Hibernate schema setting.

The backend should use a global exception handler with standardized API error responses.

Suggested error response fields:

- Timestamp.
- HTTP status.
- Error code or error name.
- Message.
- Request path.
- Optional field validation errors.

Validation should happen at two levels:

- DTO validation for input shape and simple constraints.
- Service-layer validation for business rules.

DTO validation should use Bean Validation annotations such as `@NotNull`, `@NotBlank`, and `@Positive`.

### Frontend

The first finished version may use a small React web application.

The web application should support:

- Administrator workflows as the primary interface.
- Basic client trip search and booking.
- Basic driver assigned-trip view.

Frontend MVP pages:

- Public available trips list.
- Public trip details.
- Login and client registration.
- Client passenger booking form.
- Client package request form.
- Client bookings list.
- Client package requests list.
- Client notifications.
- Driver assigned trips list.
- Driver trip details.
- Driver trip status update.
- Driver notifications.
- Admin dashboard.
- Admin vehicles CRUD.
- Admin trailers CRUD.
- Admin driver/user management.
- Admin trips CRUD and publish flow.
- Admin bookings list.
- Admin package approval queue.
- Admin notifications.

The frontend MVP should not include maps, live GPS, clickable seat layouts, advanced charts, or mobile-app-specific workflows.

### Deployment

The development environment should use Docker Compose with at least:

- Backend service.
- PostgreSQL database.
- Optional frontend service.

The repository already contains a backend Docker Compose setup. Future work should continue and refine the existing Docker configuration rather than replacing it from scratch. Backend and PostgreSQL are mandatory Compose services for the MVP; frontend containerization is optional.

## 8. Suggested Architecture

The backend should follow a layered architecture:

- Controller layer: exposes REST endpoints.
- Service layer: contains business logic.
- Repository layer: uses Spring Data JPA.
- Entity layer: maps database tables.
- DTO layer: separates API contracts from persistence models.
- Security layer: handles authentication and authorization.
- Integration layer: reserved for future external APIs.

Business rules such as seat availability, package approval, and cargo capacity calculation should live in services, not controllers.

Controllers should not expose JPA entities directly. All API request and response bodies should use DTOs to keep persistence models separate from API contracts.

Version 1 should use manual DTO mapping through simple mapper methods or mapper classes. MapStruct may be introduced later if mapping boilerplate becomes significant.

REST routes should be resource-based, with role checks applied to operations. Use routes such as `/api/vehicles`, `/api/trips`, `/api/bookings`, and `/api/package-requests`. Reserve `/api/admin/...` only for admin-specific dashboard summaries or cross-resource operations.

Public trip browsing should use `GET /api/trips/available`. A public `GET /api/trips/{id}` may be allowed only for available trips and must return a sanitized response. Driver assigned trips can use a resource-based endpoint such as `GET /api/trips/assigned-to-me`.

## 9. Initial Entity Model

The first version should include these main entities:

- `User`
- `Role`
- `DriverProfile`
- `ClientProfile`
- `Vehicle`
- `Trailer`
- `Trip`
- `TripStop`
- `Booking`
- `PackageRequest`
- `PackageItem`
- `Location`
- `Notification`

Main entities should use UUID primary keys, especially for records exposed through public or authenticated REST APIs.

Main entities should include basic audit timestamps:

- `createdAt`
- `updatedAt`

User-based audit fields such as `createdBy` and `updatedBy` are optional future enhancements.

Optional later entities:

- `Route`
- `RouteTemplate`
- `BookingPassenger`
- `UnassignedPackageRequest`
- `PriceRule`
- `Payment`
- `GpsLocation`

## 10. Key Business Rules

- A confirmed passenger booking reduces available seats.
- Only `CONFIRMED` passenger bookings consume seat capacity.
- Passenger bookings are automatically confirmed only if enough seats are available.
- Passenger bookings reserve a number of seats using `seatCount`.
- Seat capacity is calculated globally for the whole trip in version 1.
- Passenger bookings use the client account as the main contact in version 1.
- Cancelled passenger bookings release reserved seats.
- A package request does not reduce cargo capacity while it is `PENDING`.
- An approved package request reduces cargo capacity.
- Only `APPROVED` package requests consume cargo capacity.
- Cargo capacity is calculated globally for the whole trip in version 1.
- A package request cannot be approved if it exceeds remaining cargo volume or weight.
- Package approval requires both enough remaining cargo volume and enough remaining usable cargo weight.
- Each package item length, width, height, weight, and quantity are required.
- Package item quantity must be a positive integer and defaults to 1.
- Package item `weightKg` represents per-item weight; total line weight is calculated using quantity.
- Package item description is optional in version 1.
- Package item volume is calculated by the backend from dimensions.
- Package request total volume and weight are calculated from its package items.
- All items in one package request share the same pickup and delivery locations.
- Package request approval is all-or-nothing in version 1; partial item approval is out of scope.
- Clients can cancel their own pending package requests, but approved package requests require administrator cancellation.
- Clients can only book using predefined trip stops for passenger pickup and drop-off.
- Clients may book between any two ordered stops on the same trip.
- Passenger booking pickup stop order must be lower than drop-off stop order.
- Trip stops are the source of truth for origin and destination; each trip has exactly one `ORIGIN` and one `DESTINATION`.
- Package pickup and delivery use structured locations and can be manually reviewed by the administrator in version 1.
- Package requests are attached to a specific trip in version 1.
- Payments are tracked manually in version 1; no online payment processing is required.
- Payment fields live directly on bookings and package requests in version 1.
- Payment status uses `UNPAID` and `PAID` in version 1; cancellation belongs to booking/package request status.
- Prices are manually entered by the administrator in version 1.
- Passenger bookings use one total price for the whole booking in version 1.
- Package requests use one total price for the whole request in version 1.
- Money amounts use `BigDecimal` and store currency explicitly, defaulting to `EUR`.
- Trip origins, destinations, and stops use structured locations with optional coordinates.
- Locations are copy-per-use records in version 1, not globally deduplicated shared records.
- Available trips can be browsed publicly, but booking and package request actions require client authentication.
- A trip is available to clients only when it is `PLANNED` and has a future departure date.
- `DRAFT` trips are not publicly visible.
- Moving a trip from `DRAFT` to `PLANNED` requires complete route, schedule, resource, and capacity information.
- Administrators can manage all trip status transitions.
- Assigned drivers can only move assigned trips from `PLANNED` to `IN_PROGRESS` and from `IN_PROGRESS` to `COMPLETED`.
- Cancelling a trip cancels active passenger bookings and pending or approved package requests attached to that trip.
- New passenger bookings are allowed only when an available trip has enough remaining seats.
- New package requests are allowed only for available trips.
- Administrators cannot override seat, cargo volume, or cargo weight limits in version 1.
- Vehicle/trailer assignments and capacity snapshots are locked once a trip has confirmed bookings or approved package requests.
- Drivers, vehicles, and trailers must be `ACTIVE` and free of overlapping planned/in-progress trips before assignment.
- A driver can be assigned only when the linked user account is `ACTIVE` and the driver profile status is `ACTIVE`.
- Trips require an estimated arrival date and time before vehicle/trailer assignment or public availability.
- Only administrators can create trips and assign vehicles, trailers, and drivers.
- Drivers can only manage trips assigned to them.
- Drivers can only view client contact information for assigned trips.
- Clients can only manage their own bookings and package requests.
- Clients can view limited driver contact information only after a booking is confirmed or a package request is approved.
- Public trip browsing must not expose sensitive contact or operational details.
- Users can log in only when their account status is `ACTIVE`.
- Notifications are stored as read/unread database records in version 1.
- Notifications are created synchronously by service-layer operations in version 1.
- Public registration creates client accounts only.
- Public registration must not accept role selection from the client.
- Driver accounts are created or promoted by administrators.
- Administrator accounts are seeded or created manually.
- Driver accounts may be created by administrators with temporary passwords in version 1.
- Each user has exactly one role in version 1.
- Common identity fields live on `User`; role-specific data lives in profile entities.
- REST controllers use DTOs for all request and response bodies; JPA entities are not exposed directly.
- DTO mapping is manual in version 1; MapStruct is optional future cleanup.
- API errors use a standardized response format through a global exception handler.
- DTO validation handles input constraints; service-layer validation handles business rules.
- A trip has exactly one assigned driver in version 1.
- A trip has exactly one assigned vehicle and may have one trailer in version 1.
- Trip seat and cargo calculations use trip capacity snapshots, not live vehicle/trailer capacity values.
- Vehicles do not store available seats; remaining seats are calculated per trip.
- Cargo dimensions use centimeters, cargo volume uses cubic centimeters, and weight uses kilograms.
- Cargo weight capacity represents usable cargo weight capacity in version 1.
- Important business records should use status-based deactivation or cancellation instead of hard delete.
- Hard delete is allowed only for unused draft/simple records where no business history or relationships would be lost.
- Main entities include `createdAt` and `updatedAt` audit timestamps.

## 11. Development Phases

The project should be implemented backend-first. Entities, persistence, service-layer business rules, REST APIs, Swagger documentation, and backend tests should be stabilized before expanding the frontend.

Development should continue from the existing implementation in this repository. Existing backend, frontend, Docker, security, controller, service, repository, and model code should be reviewed and evolved rather than discarded or regenerated.

Refactoring should be incremental. Existing code should be changed only where needed to satisfy the PRD architecture, role rules, DTO boundaries, validation, entity relationships, capacity calculations, or other core business requirements. Unrelated rewrites should be avoided.

The final database schema should be managed with Flyway migrations, preferably under `src/main/resources/db/migration`. Hibernate `ddl-auto=update` should not be relied on for the final version.

Current implementation alignment notes:

- The backend already has Spring Boot, Gradle, PostgreSQL configuration, Docker Compose for PostgreSQL, JWT-related classes, users, vehicles, and basic controllers/services/repositories.
- Security is currently permissive and must be tightened before protected workflows are considered complete.
- Authentication and user registration currently exist in more than one controller path and should be consolidated.
- Final auth endpoints should live under `/api/auth`, with user/admin management handled separately.
- Some controllers currently expose JPA entities directly and should be migrated to DTO request/response models.
- Existing direct vehicle-to-driver assignment should be evolved toward trip-based driver/vehicle/trailer assignment.
- Current numeric IDs should be evaluated against the PRD decision to use UUIDs for main entities.
- Direct vehicle-driver assignment is not part of the final MVP model. Existing `Vehicle.driver` or `UserVehicle` style assignment should be deprecated once trip-based assignment is implemented.
- UUIDs are the target for final main entities, but existing `Long` IDs may remain temporarily until the broader core entity redesign for trips, bookings, packages, users, and vehicles.

### Phase 1: Project Setup

- Confirm Spring Boot project structure.
- Configure PostgreSQL.
- Add Docker Compose.
- Add Swagger/OpenAPI.
- Add health or test endpoint.

### Phase 2: Authentication and Roles

- Implement registration and login.
- Add JWT authentication.
- Add role-based authorization.
- Seed or create an administrator account.
- Enable the JWT filter and remove permissive `permitAll` security except for explicitly public endpoints.
- Establish endpoint access rules before expanding trip, booking, and package features.
- Use URL-level authorization for broad route access, method-level annotations for role checks, and service-layer ownership checks for user-specific data access.

### Phase 3: Core Database Model

- Implement entities and relationships.
- Add migrations or schema generation strategy.
- Validate JPA mappings.

### Phase 4: Vehicle, Trailer, and Driver Management

- Add CRUD APIs for vehicles.
- Add CRUD APIs for trailers.
- Add driver profile management.

### Phase 5: Trip Management

- Add trip creation and listing.
- Add trip stop management.
- Add driver, vehicle, and trailer assignment.
- Add trip status updates.

### Phase 6: Passenger Bookings

- Add booking APIs.
- Add automatic seat availability checks.
- Prevent overbooking.
- Expose remaining seats.

### Phase 7: Package Requests and Cargo Capacity

- Add package request APIs.
- Calculate package volume.
- Add admin approval/rejection flow.
- Prevent cargo volume and weight overflow.
- Expose remaining cargo capacity.

### Phase 8: Basic Notifications

- Store notifications for important events.
- Expose notification listing APIs.

### Phase 9: Frontend MVP

- Build administrator dashboard.
- Build basic client trip booking view.
- Build basic driver assigned-trip view.

### Phase 10: Testing and Documentation

- Add unit tests for service-layer business rules.
- Add integration tests for important API workflows.
- Complete Swagger documentation.
- Add dissertation diagrams and screenshots.

Mandatory service-layer tests:

- Passenger booking prevents overbooking.
- Cancelled passenger booking releases seats.
- Package approval prevents cargo volume overflow.
- Package approval prevents cargo weight overflow.
- Pending, rejected, and cancelled package requests do not consume cargo capacity.
- Trip publishing requires complete route, schedule, resource, and capacity data.
- Resource overlap prevents assigning unavailable drivers, vehicles, or trailers.

Mandatory integration tests:

- Client registration and login.
- Client passenger booking flow.
- Package request creation and admin approval flow.
- Role access restrictions for administrator, driver, and client endpoints.

## 12. Success Criteria

The MVP is successful when:

- An administrator can create a trip with vehicle, driver, stops, and optional trailer.
- A client can book a passenger seat on a trip without exceeding seat capacity.
- A client can submit a package request.
- An administrator can approve or reject package requests.
- The system correctly calculates remaining seats and cargo capacity.
- A driver can view assigned trips and update trip status.
- APIs are protected by role-based authorization.
- The application can run locally with Docker Compose.
- API documentation is available through Swagger/OpenAPI.

## 13. Future Enhancements

After the MVP is complete, the project may add:

- WebSocket-based real-time notifications.
- Driver GPS location sharing.
- Client vehicle tracking.
- Route optimization with Google Maps, Mapbox, or OpenRouteService.
- Nearby request detection.
- Unassigned package request marketplace and trip matching.
- Mobile application with React Native.
- Exact van seat layout and clickable seat selection.
- Segment-based seat occupancy and seat reuse between stops.
- Passenger check-in, picked-up, dropped-off, and no-show tracking.
- Passenger luggage allowance, extra luggage volume, and extra luggage pricing.
- Segment-based cargo occupancy and package space reuse between stops.
- Package pickup, in-transport, delivered, and proof-of-delivery tracking.
- Partial package item approval and item-level package statuses.
- Package photos and damage/proof documentation.
- Detailed passenger records per booking.
- Pricing rules for passengers and packages.
- Payment tracking.
- Online payment processing.
- Phone dialer integration.
- Self-service password reset and invitation email flows.
