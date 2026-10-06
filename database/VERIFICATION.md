# Final database verification

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
