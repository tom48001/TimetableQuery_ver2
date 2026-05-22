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
