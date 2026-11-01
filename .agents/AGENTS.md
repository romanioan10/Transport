# TransportApp development context

Before continuing implementation, read `BUILD_HANDOFF.md` for the last verified stopping point and next actions. Also read `IMPLEMENTATION_PROGRESS.md`, `PRD.md`, and `REQUIREMENTS_GAP_ANALYSIS.md`. Backend-specific instructions live in `Backend/AGENTS.md`.

- Latest user direction: finish foundation configuration only, then stop. Future features, migrations, and service extraction are to be built with the user in small learning steps after they ask to continue. Roadmap items are not authorization to implement them automatically.
- Build incrementally from the existing code. Preserve user changes, existing database data, and the Compose volume mapping.
- Keep the handoff updated after meaningful changes and verification, including failures and unverified work. Update tracker checkboxes only with evidence.
- The agreed target is Identity, Transport Operations, and Notifications behind a gateway; keep transactional trip/booking/package capacity rules together initially.
- Do not mark configured containers as runtime-verified until images build and the application workflows run.
- Local secrets belong in ignored environment files. Do not print or commit credentials.
- Backend uses Maven only. Gradle wrapper removal and index-only removal of previously tracked IDE/build artifacts are intentional user-requested cleanup. Preserve those staged deletions; keep generated output and IDE metadata ignored.
