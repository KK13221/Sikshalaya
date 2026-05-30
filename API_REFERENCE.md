# Sikshalaya Global — API Reference

**Base URL:** `http://localhost:5000/api`  
**Auth:** All protected routes require a cookie-based JWT token (set automatically on login).  
**API Docs (Swagger):** `http://localhost:5000/api-docs`

---

## Authentication

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/login` | No | Any | Login with email + password |
| POST | `/auth/verify-otp` | No | Any | Verify OTP sent after login |
| POST | `/auth/logout` | Yes | Any | Logout (clears cookie) |
| GET | `/auth/me` | Yes | Any | Get current logged-in user |
| PUT | `/auth/change-password` | Yes | Any | Change password |

**Login Request:**
```json
{ "email": "principal@school.com", "password": "yourpassword" }
```

---

## Schools *(Super Admin only)*

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/schools` | Yes | superadmin | List all schools/branches |
| POST | `/schools` | Yes | superadmin | Create a new school |
| GET | `/schools/stats` | Yes | superadmin | Aggregated stats across all schools |
| GET | `/schools/:id` | Yes | superadmin | Get a single school |
| PUT | `/schools/:id` | Yes | superadmin | Update school |
| DELETE | `/schools/:id` | Yes | superadmin | Delete school |

---

## Students

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/students` | Yes | Any | List students (supports `?search=`, `?classId=`, `?page=`, `?limit=`) |
| POST | `/students` | Yes | superadmin, principal | Add a new student |
| GET | `/students/overview` | Yes | Any | Summary counts |
| GET | `/students/underperformers` | Yes | Any | Students below 75% in any dimension |
| GET | `/students/:id` | Yes | Any | Get single student profile |
| PUT | `/students/:id` | Yes | superadmin, principal | Update student |
| DELETE | `/students/:id` | Yes | superadmin, principal | Delete student |
| GET | `/students/:id/metrics` | Yes | Any | Academic + attendance + behaviour metrics |
| PATCH | `/students/:id/acknowledge` | Yes | Any | Acknowledge underperformer flag |

**Student Object Fields:**
`name`, `admissionNo`, `rollNo`, `gender`, `dateOfBirth`, `classId`, `section`, `guardianName`, `guardianRelation`, `guardianPhone`, `guardianEmail`, `city`, `state`, `isActive`

---

## Teachers

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/teachers` | Yes | Any | List all teachers (supports `?search=`, `?limit=`) |
| POST | `/teachers` | Yes | superadmin, principal | Add a new teacher |
| GET | `/teachers/:id` | Yes | Any | Get single teacher |
| PUT | `/teachers/:id` | Yes | superadmin, principal | Update teacher |
| DELETE | `/teachers/:id` | Yes | superadmin, principal | Delete teacher |

**Teacher Object Fields:**
`name`, `employeeId`, `subjects` (array), `experience` (years), `qualification`

### Teacher Mobile App Endpoints *(logged-in teacher only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/teachers/me/classes` | Get the teacher's assigned classes |
| GET | `/teachers/me/students?classId=` | Get students in one of the teacher's classes |
| GET | `/teachers/me/attendance` | Get attendance records the teacher has submitted |
| POST | `/teachers/me/attendance` | Mark attendance for a class |
| GET | `/teachers/me/assessments` | Get assessments assigned to the teacher |
| GET | `/teachers/me/chapters` | Get chapters for the teacher's subjects |
| PATCH | `/teachers/me/assessments/:assessmentId/marks/:studentId` | Enter/update a mark for one student |
| GET | `/teachers/me/notifications` | Get the teacher's notifications |

---

## Classes

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/classes` | Yes | Any | List all class sections |
| POST | `/classes` | Yes | Any | Create a new class section |
| PUT | `/classes/:id` | Yes | Any | Update a class section |

**Class Object Fields:**
`name` (e.g. "Class 9"), `section` (e.g. "A"), `academicYear`, `subjects` (array)

---

## Attendance

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/attendance` | Yes | Any | List attendance records (supports filters) |
| POST | `/attendance` | Yes | Any | Submit attendance for a class |

**Mark Attendance Request:**
```json
{
  "classId": 1,
  "date": "2026-05-29",
  "records": [
    { "studentId": 101, "status": "present" },
    { "studentId": 102, "status": "absent" },
    { "studentId": 103, "status": "late" }
  ]
}
```
Status values: `present` · `absent` · `late`

---

## Chapters (Curriculum)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/chapters` | Yes | Any | List chapters (`?classNum=9&subjectId=Mathematics`) |
| POST | `/chapters` | Yes | superadmin, principal | Add a chapter |
| PATCH | `/chapters/:id` | Yes | superadmin, principal | Update chapter (e.g. change status) |
| DELETE | `/chapters/:id` | Yes | superadmin, principal | Delete a chapter |

**Chapter Object Fields:**
`chapterNumber`, `name`, `subjectId`, `classNum`, `periods`, `maxMarks`, `status` (upcoming / in_progress / done)

---

## Assessments & Marks

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/assessments` | Yes | Any | List assessments (`?classNum=`, `?type=`, `?section=`) |
| POST | `/assessments` | Yes | Any | Create an assessment |
| GET | `/assessments/:id/marks` | Yes | Any | Get all marks for an assessment |
| PATCH | `/assessments/:id/marks/:studentId` | Yes | Any | Enter or update a student's mark |
| POST | `/assessments/:id/submit` | Yes | Any | Submit/finalise an assessment |
| POST | `/assessments/publish` | Yes | superadmin, principal | Publish results for a batch |

**Assessment Types:** `chapter_test` · `class_test` · `unit_test` · `term_exam`

**Upsert Mark Request:**
```json
{ "marks": 85, "absent": false }
```

---

## Fees

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/fees` | Yes | Any | List fee records |
| POST | `/fees` | Yes | superadmin, principal | Create a fee record |
| PUT | `/fees/:id` | Yes | superadmin, principal | Update fee / mark as collected |

---

## Behaviour

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/behaviour/presets` | Yes | Any | Get preset behaviour tags/incidents |
| GET | `/behaviour/logs` | Yes | Any | List behaviour log entries |
| POST | `/behaviour/logs` | Yes | Any | Log a behaviour incident for a student |

---

## Behaviour Metrics

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/behaviour-metrics` | Yes | Any | List behaviour metric definitions |
| POST | `/behaviour-metrics` | Yes | Any | Create a metric definition |
| DELETE | `/behaviour-metrics/:id` | Yes | Any | Delete a metric definition |

---

## Notifications

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/notifications` | Yes | Any | List notifications for the logged-in user |
| PATCH | `/notifications/:id/read` | Yes | Any | Mark one notification as read |
| PATCH | `/notifications/read-all` | Yes | Any | Mark all notifications as read |

---

## Dashboard

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/dashboard/superadmin` | Yes | superadmin | Aggregated stats for all branches |
| GET | `/dashboard/principal` | Yes | superadmin, principal | Stats for the logged-in principal's branch |

**Principal Dashboard Response includes:**
`totalStudents`, `totalTeachers`, `attendance` (pct, present, total), `passRate`, `branchRank`, `classesMarked`, `classesMissing`, `teachersIn`, `marksPending`

---

## Users *(Admin management)*

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/users` | Yes | Any | List user accounts |
| POST | `/users` | Yes | Any | Create a user account |
| PUT | `/users/:id` | Yes | Any | Update a user account |
| DELETE | `/users/:id` | Yes | Any | Delete a user account |

---

## Role Permissions Summary

| Role | Access |
|---|---|
| `superadmin` | All endpoints across all schools |
| `principal` | Branch-level read/write (students, teachers, classes, marks, attendance) |
| `teacher` | Own classes only via `/teachers/me/*` endpoints |

---

## Error Response Format

All errors return:
```json
{
  "success": false,
  "message": "Error description here"
}
```

| HTTP Code | Meaning |
|---|---|
| 400 | Validation error (missing field, duplicate entry) |
| 401 | Not logged in / token expired |
| 403 | Insufficient role/permission |
| 404 | Record not found |
| 500 | Server error |

---

*API Reference — Sikshalaya Global · May 2026*
