# Final database verification

## Teacher roster — 2026-10-06

- Supplied roster headers were read successfully; UserLogin is not used as an automatic timetable-code match.
- Unit checks cover missing mappings, duplicate teacher codes, duplicate emails and rows without accounts.
- Isolated MySQL/Express integration verified preservation of teacher IDs and lessons, Teacher-only account creation, linking an existing subject-head account without permission changes, no-account records, idempotent re-import and conflict rollback.
- 29 default tests passed; the opt-in roster integration test passed separately. Targeted frontend/backend lint and Docker production builds passed.
- No real roster records were imported; the user confirms the code mapping in the preview first.

## Import progress — 2026-10-06

- MySQL-backed asynchronous jobs verified against a disposable schema through the actual Express import routes.
- 1,100-row Excel timetable: saved counts of 500, 1,000 and 1,100 observed independently of the import transaction; final job successful.
- Deliberate duplicate in the second batch: failed at 500/501, error persisted, original 1,100 timetable rows preserved by rollback.
- Missing-class errors retained their structured details. Student and group imports reached successful terminal states with correct counts.
- Progress rejected unauthenticated requests and hid jobs from a different user. Startup marked interrupted jobs failed.
- 27 default tests passed, including UI polling success, failure, network error and page teardown. The opt-in database integration test passed separately.
- Targeted frontend/backend ESLint and Docker production builds passed.
- New installs now include `import_jobs` (26 tables); existing installations create this table at backend startup.

## Installer update — 2026-10-06

Verified the updated `school_install.sql` in a separate test database on Docker MySQL 8.0; the application database was not modified.

- Fresh installation and a second run both completed successfully: 25 tables, 24 classes, 4 core subjects, 56 rooms and 12 periods.
- A customized period start time and reward name survived the second run.
- Chinese subject text round-tripped correctly as UTF-8.
- No manager account was created automatically (`manager_count = 0`).
- `git diff --check` passed for the installer and README.
- The earlier application/import verification below predates the school-specific presets; those tests were not repeated for this SQL-only change.

## Earlier baseline verification

Verified with a disposable MySQL 8.0 container using only `database/school_install.sql`.

## Fresh install

- Installation completed without SQL errors.
- 25 tables and 28 foreign-key constraints were created.
- `subject`, `class`, and `room` started empty.
- 12 required timetable periods were installed.
- `school_install.sql`, `schema.sql`, and the archived prior production schema had matching SHA-256 content at verification time.

## Application and import

- Backend started against the fresh database.
- Production frontend build completed and returned HTTP 200 from a static server.
- Manager semester settings API loaded successfully.
- Subject nomination/class-count and subject-head APIs loaded successfully.
- A sample Excel timetable imported successfully through the authenticated backend API.
- First import created 6 teachers, 6 subjects, 1 class, 6 rooms, and 6 timetable rows.
- Re-import created 0 teachers, 0 subjects, 0 classes, and 0 rooms; subject count remained 6 with 6 distinct `import_name` values.
- No orphan timetable-to-subject references were found.

## Subject assertions

| import_name | subject_name | block |
|---|---|---|
| CHEM-B1 | CHEM | X1 |
| CHEM-B2 | CHEM | X2 |
| PHY-B2 | PHY | X2 |
| BIO-B3 | BIO | X3 |
| ENG | ENG | NULL |
| MATH | MATH | NULL |

The elective API returned one displayed CHEM option with alias IDs for both rows and `elective_blocks: [X1, X2]`.

## Automated verification

- 20 backend tests passed.
- Backend and frontend targeted ESLint checks passed.
- Frontend production build passed.
- `git diff --check` passed.

## Development-server note

The legacy webpack-dev-server 2 dependency cannot run on Node 26 because Node removed the old `http_parser` binding. This does not affect the verified production frontend build. Use a compatible older Node runtime for development mode or schedule a separate frontend toolchain upgrade.
