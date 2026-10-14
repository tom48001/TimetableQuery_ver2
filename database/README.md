# Database files

This directory is the canonical home for database SQL. For the current Windows Server 2019 + Node.js + MySQL deployment, follow the root [README](../README.md). Docker is not required.

- `school_install.sql`: the only SQL file required for a brand-new school installation.
- `schema.sql`: base schema reference without the school-specific class, subject and room presets. Use `school_install.sql` for a new installation.
- `migrations/`: one-time, ordered upgrades for an existing database.
- `seeds/`: development/test-only data. Never run these files against production.
- `archive/`: preserved historical SQL. Do not run these files for a fresh installation.

## Fresh school installation

1. Install MySQL 8.0 or newer and create a database-capable account.
2. Run exactly one file:

   ```sh
   mysql -u root -p < database/school_install.sql
   ```

3. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and `DB_NAME=school_management` in `server/.env`.
4. Configure the Google login and JWT/session environment variables documented in `server/.env.example`.
5. Start the backend and build/serve the frontend.
6. Follow the `FIRST MANAGER ACCOUNT` example in `school_install.sql` to create your real Google account in the `user` table. Set the same email in `MANAGER_EMAILS` and its domain in `GOOGLE_ALLOWED_DOMAIN`; the environment setting alone does not create the account. Then sign in and import the school timetable Excel file.

The installer includes the school's class and room presets and four core subjects (CHIN, ENG, MATH, CS). Review them before installation. Additional subjects are created by Excel import using `import_name` UPSERT semantics; no separate subject seed is required.

Re-running the current installer preserves existing reference records, period times and reward rules. It does not upgrade the structure of existing tables; use migrations for older installations. Check Workbench's Action Output for errors and the final counts, including `manager_count` (zero means no manager has been created yet).

## Legacy Docker deployment (optional)

The repository root contains `compose.yml`, which runs MySQL 8, the Express backend and the production Vue/Nginx frontend together.

1. Keep the existing MySQL database until the Docker installation has been verified. Back it up before migration.
2. Copy `.env.docker.example` to `.env.docker` and replace every `CHANGE_ME` value. `DB_PASS` must equal `MYSQL_PASSWORD`.
3. For local Google login, register `http://localhost:3000/auth/google/callback` as an authorized redirect URI. In production, replace it with the real HTTPS callback URL. `CLIENT_ORIGIN` remains the public frontend URL.
4. Start the stack from the repository root:

   ```sh
   docker compose up --build -d
   docker compose ps
   docker compose logs -f
   ```

5. Open `http://localhost:8080`. MySQL is available to Workbench at `127.0.0.1:3307`; use the credentials in `.env.docker`.

`school_install.sql` runs automatically only when the `mysql_data` volume is created for the first time. Restarting or running `docker compose down` preserves the database. Do not run `docker compose down -v` unless a verified backup exists and the Docker database is intentionally being erased.

To stop without deleting data:

```sh
docker compose down
```

For a production hostname, put HTTPS in front of port 8080 and update both `CLIENT_ORIGIN` and `GOOGLE_CALLBACK_URL`. Do not expose MySQL port 3307 publicly; the supplied Compose file binds it to `127.0.0.1` only.

This application currently uses a legacy Vue/Webpack development toolchain. The production frontend build is verified. For `npm start` development mode, use a Node version compatible with webpack-dev-server 2 rather than Node 26.

## Existing database upgrade

Back up the existing database first. Do not run `school_install.sql` over an existing installation. Apply only the relevant ordered migrations:

```sql
SOURCE database/migrations/001_subject_import_identity.sql;
SOURCE database/migrations/002_room_canonicalization.sql;
SOURCE database/migrations/003_subject_nomination_eligibility.sql;
SOURCE database/migrations/004_system_settings_and_junior_rules.sql;
SOURCE database/migrations/005_import_jobs.sql;
```

The migration preserves `subject_id`, so timetable, student, nomination, teacher-subject, and history foreign keys remain valid. It does not delete subjects. New installations already contain the final schema and do not need this migration.

## Import behavior

### Teacher accounts

Teacher numbers are the database's existing auto-increment `teacher_id`, displayed with at least three digits (`001`, `073`, `1000`). They remain stable and are separate from the CSV's `teacher_code`; deleted/rolled-back IDs may leave gaps. No renumbering or additional counter is used. Roster imports reuse the previously confirmed `source_login` → teacher mapping when the code is absent. Duplicate logins, ambiguous saved mappings and conflicting reassignments block the import for review. When there is no saved mapping or explicit selection, the importer tries the email already linked to a teacher, then a unique exact English/Chinese name (ignoring case and repeated whitespace). Ambiguous or unmatched names require manual confirmation. Partial/fuzzy names are never automatically linked.

The Data Import page has a Teacher Roster tab (requires `manageUsers`). It reads `UserLogin`, `UserEmail`, `EnglishName`, `ChineseName`, plus optional `TeacherCode`/`Abbreviation`. UserLogin is not assumed to be the timetable code: map rows explicitly in the preview. Correct duplicate codes, duplicate emails and existing-account conflicts, validate, then confirm. Saving revalidates inside a transaction and uses the existing import-job progress API.

The roster preserves teacher IDs and timetables, updates bilingual names and source login, creates Teacher-role Google-only accounts only for non-empty emails, and preserves existing accounts' roles, permissions and credentials. Missing email never unlinks an existing account. User Management shows roster metadata and a separate “Teachers without accounts” list. Roster metadata columns are added automatically on first use for existing databases and are included in the fresh installer. A preview warning identifies emails outside `GOOGLE_ALLOWED_DOMAIN`; importing an account does not change Google login domain settings.

Timetable import creates teacher profiles, not login accounts. In User Management, select the imported teacher by code when adding or editing an account, then enter their real Google email. The link preserves the original teacher ID, timetable and nominations; account display names do not overwrite imported teacher names. A password is optional for Google-only accounts. An account without a teacher link has no personal timetable.

Account creation/editing and teacher linking run in one transaction. Already-linked teachers cannot be claimed by another account. Listing accounts no longer creates teacher profiles automatically. Deleting an account keeps the imported teacher and timetable and clears only the account link. Existing placeholder profiles are preserved when relinking; they are not automatically deleted or merged.

### Live progress

Time-table, student and group imports accept `?async=1`. The upload returns HTTP 202 with a `jobId`; poll `GET /api/import/progress/:jobId` with the same authenticated user's token. The UI polls every 750 ms and displays `Math.round(processedRows / totalRows * 100)` (zero before the file's row count is known). File upload bytes are separate from import row progress.

Jobs are stored in `import_jobs` with pending/processing/success/failed status, row counts, error message and the original result/error details. Only the initiating user can read a job. Timetable progress advances after each database insert batch; student progress advances every 50 saved rows and at the final row; group progress advances after saved batches. Skipped rows count as processed. Counts describe work performed, not committed rows: 100% may briefly show “Saving” until the transaction commits. Failure preserves the last processed count and the import transaction rolls back.

The current worker runs inside the single backend process. On restart, unfinished jobs are marked failed with a message to check import history before retrying; they are not automatically replayed. Do not run multiple backend replicas with this worker. Existing synchronous API callers remain supported. Startup creates the job table for existing installations; uploaded temporary files are removed after processing. A lost polling connection stops polling and tells the user to check history; it does not cancel the server job.

Timetable Excel values are stored as `import_name`. A final `-B1`, `-B2`, or `-B3` suffix is converted to `block = X1`, `X2`, or `X3`, while `subject_name` contains the suffix-free display value. Re-import uses the unique `import_name` key with UPSERT behavior.

## Archived development SQL

All historical files are preserved under `database/archive/`; none were permanently deleted. They are not part of either installation workflow. After a real-school backup and upgrade have been verified, the files marked safe in `SQL_AUDIT.md` may be permanently removed.
