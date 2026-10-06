# Database files

This directory is the canonical home for database SQL.

- `school_install.sql`: the only SQL file required for a brand-new school installation.
- `schema.sql`: readable canonical schema; currently identical to `school_install.sql`.
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
6. Sign in with the configured manager account and import the school timetable Excel file.

The subject table intentionally starts empty. Do not run a subject seed. The Excel import creates subjects using `import_name` UPSERT semantics.

## Docker deployment (recommended)

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
```

The migration preserves `subject_id`, so timetable, student, nomination, teacher-subject, and history foreign keys remain valid. It does not delete subjects. New installations already contain the final schema and do not need this migration.

## Import behavior

Timetable Excel values are stored as `import_name`. A final `-B1`, `-B2`, or `-B3` suffix is converted to `block = X1`, `X2`, or `X3`, while `subject_name` contains the suffix-free display value. Re-import uses the unique `import_name` key with UPSERT behavior.

## Archived development SQL

All historical files are preserved under `database/archive/`; none were permanently deleted. They are not part of either installation workflow. After a real-school backup and upgrade have been verified, the files marked safe in `SQL_AUDIT.md` may be permanently removed.
