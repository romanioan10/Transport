# AGENTS.md

## Project context

This is an existing Java project opened in IntelliJ.

Before making code changes:
- Understand the current structure.
- Prefer small, safe changes.
- Do not rewrite working code unless necessary.
- Keep the existing style and naming conventions.
- Explain what files will be changed before editing.

## Build and test

If this is a Maven project:
- Use `mvn clean test` to verify changes.

If this is a Gradle project:
- Use `./gradlew test` or `gradlew.bat test` on Windows.

## Planning rule

For any feature, refactor, architecture change, database change, API change, or unclear task:
- First use the `grill-me` skill.
- Create or update a plan before implementation.
- Do not start coding until the plan has been criticized and improved.

## Java rules

- Keep business logic out of controllers when possible.
- Prefer services for business logic.
- Prefer DTOs for API/input-output models when needed.
- Add or update tests when behavior changes.
- Avoid introducing new dependencies without asking first.

# AGENTS.md

## Project context

This is an existing Java project opened in IntelliJ.

Before making code changes:
- Understand the current structure.
- Prefer small, safe changes.
- Do not rewrite working code unless necessary.
- Keep the existing style and naming conventions.
- Explain what files will be changed before editing.

## Build and test

If this is a Maven project:
- Use `mvn clean test` to verify changes.

If this is a Gradle project:
- Use `./gradlew test` or `gradlew.bat test` on Windows.

## Planning rule

For any feature, refactor, architecture change, database change, API change, or unclear task:
- First use the `grill-me` skill.
- Create or update a plan before implementation.
- Do not start coding until the plan has been criticized and improved.

## Java rules

- Keep business logic out of controllers when possible.
- Prefer services for business logic.
- Prefer DTOs for API/input-output models when needed.
- Add or update tests when behavior changes.
- Avoid introducing new dependencies without asking first.