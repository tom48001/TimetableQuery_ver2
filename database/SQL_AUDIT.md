# SQL audit

No SQL filename is referenced by Docker, Compose, package scripts, application startup, Node/Python scripts, README, or CI. Runtime schema checks are implemented in the Node backend rather than by loading these files.

| Legacy file | Purpose | Schema | Migration | Seed/demo | Backup/obsolete | Runtime dependency | Superseded by | Recommendation |
|---|---|---:|---:|---:|---:|---:|---|---|
| `database/archive/production_schema.sql` | Previous production schema | Yes | No | Master defaults only | Archived snapshot | No | `school_install.sql` | MERGED INTO FINAL INSTALL |
| `database/archive/setup_test_database.sql` | Recreates a complete test DB | Yes | No | Yes | Archived snapshot | No | `seeds/test.sql` | TEST ONLY |
| `database/archive/data.sql` | Destructive development reset and demo data | No | No | Yes | Obsolete | No | Test seed/import workflows | SAFE TO DELETE later |
| `database/archive/env.sql` | Early destructive schema draft | Yes | No | Small defaults | Obsolete | No | `school_install.sql` | SAFE TO DELETE later |
| `database/archive/school_reference_seed.sql` | Generated reference/teacher/subject seed | No | Partial upgrades | Yes | Subject portion obsolete | No | Excel import + final schema | ARCHIVE |
| `database/archive/school_student_duplicates_skipped.sql` | Generated test students; deletes current students | No | No | Yes | Historical fixture | No | `seeds/test_students.sql` | TEST ONLY / SAFE TO DELETE later |
| `database/archive/fix_duplicate_rooms.sql` | One-time canonical room merge | No | Yes | No | Archived source | No | migration 002 | MERGED INTO MIGRATION |
| `database/archive/fix_subject_data.sql` | Hard-coded legacy subject merge | No | Yes | No | Obsolete | No | migration 001 | SAFE TO DELETE later |
| `database/archive/fix_subject_nomination_eligibility.sql` | Nomination eligibility upgrade | No | Yes | No | Archived source | No | schema + migration 003 | MERGED INTO FINAL INSTALL |
| `database/archive/update_subject_block_labels.sql` | Adds block numbers to display translations | No | Yes | No | Conflicts with final design | No | `subject.block` metadata | SAFE TO DELETE later |

The manager-controlled semester and junior-allocation schema is represented by migration 004 for existing installations and is already merged into `school_install.sql` for fresh installations.
