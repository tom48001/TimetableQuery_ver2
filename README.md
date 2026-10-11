Timetable System (TimetableQuery_ver2)

A school timetable management system for teachers and admins.  
Teachers can view schedules, search free periods, check student/room timetables, and request lesson swaps.  
Admins can import the official timetable Excel, manage teacher accounts, and monitor schedules.

### Teacher
- Google Login (OAuth)
- View personal timetable
- Search free teachers by date/period/special session
- Check student timetable
- Check room usage / room timetable
- View elective course lists (S4–S6, includes additional 10th period)
- Request swap lesson (select teacher → select lesson → show available free teachers)
- Recent messages panel (announcements & activities)
- Activity lookup by date (internal/external)

### Admin (Manager)
- Manage teacher accounts (create / update / delete)
- Reset teacher password (support custom password)
- Import Education Bureau Excel timetable
- Observe class / view multiple teachers schedules
---

**Project Structure**

```
├── client/        # Vue frontend
└── server/        # Node.js + Express backend
```

---

**Installation & Setup**
1. Frontend Setup (Client)
```
cd client
npm install
npm start
```
2.Backend Setup (Server)
```
cd server
npm install
npm start
```
# Docker quick start

The recommended deployment runs the frontend, backend and MySQL 8 with Docker Compose. See [database/README.md](database/README.md) for the complete safe installation and migration procedure.

```sh
cp .env.docker.example .env.docker
# Edit .env.docker and replace every CHANGE_ME value.
npm start
```

Open `http://localhost:8080`. MySQL Workbench can connect to `127.0.0.1:3307`.

`npm start` now starts the complete Docker stack in the foreground. Press `Ctrl+C` to stop it. Use `npm run docker:up` to run it in the background. The previous non-Docker development command remains available as `npm run start:local` when a compatible legacy Node.js version is installed and the Docker ports are not in use.

### Root-only frontend navigation

Vue Router uses abstract (in-memory) mode. Existing route names, query parameters,
components and authorization guards still apply, while the browser address stays
at `/`. The current internal route is saved in per-tab session storage for refresh
and scoped to the signed-in user. If storage is unavailable, refresh opens Home
or Login. Legacy paths are read on entry and replaced with `/`; Google callback
parameters are consumed from the internal route and are not saved in session storage.
API routes and the database schema are unchanged. The existing nginx SPA fallback
must remain enabled for legacy entry URLs.

Run routing regression tests with `cd client` then `npm run test:navigation`.
