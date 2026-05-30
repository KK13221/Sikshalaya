# Sikshalaya Global Mobile Application — Mock Data Feed Guide

This reference guide lists the exact mock datasets, payload formats, and data model mapping schemas built into the Sikshalaya Global Teacher Mobile Application. Share this file with Claude or other testing platforms to check if your API endpoints, data parsers, and UI components are loading data correctly.

---

## 1. Authentication Details & User Profile
The application initiates login via a `POST` request to `/api/auth/login`.

### Login Credentials (for Testing)
* **Teacher Login:**
  * **Email:** `kamlesh.sharma@shikshalaya.in`
  * **Password:** `Teacher@123`
* **Principal Login:**
  * **Email:** `principal.gurugram@shikshalaya.in`
  * **Password:** `Principal@123`

### Profile Model (`TeacherUser`)
```json
{
  "id": "t1",
  "name": "Kamlesh Sharma",
  "email": "kamlesh.sharma@shikshalaya.in",
  "role": "teacher",
  "schoolId": 1,
  "branch": "Branch 1",
  "teaches": ["class_1_a", "class_2_b"]
}
```

---

## 2. Dashboard Analytics
Aggregated parameters loaded by `dashboardProvider` on the main feed.

* **Endpoint:** `/api/dashboard`
* **Payload Structure:**
```json
{
  "classesCount": 4,
  "studentsCount": 120,
  "attendancePercentage": 92.5,
  "pendingAssessmentsCount": 3,
  "urgentNotificationsCount": 2
}
```

---

## 3. Class List & Roster
Class cards loaded dynamically on the Classes tab.

* **Endpoint:** `/api/classes`
* **Payload Structure:**
```json
[
  {
    "id": "class_1_a",
    "name": "Class 1",
    "section": "A",
    "subjects": ["Mathematics", "Science"],
    "studentCount": 32,
    "attendancePercent": 94
  }
]
```

---

## 4. Student Profiles
Lists students mapped under a particular class.

* **Endpoint:** `/api/students?classId={classId}`
* **Payload Structure:**
```json
[
  {
    "id": "student_101",
    "name": "Aditya Gupta",
    "rollNo": 17,
    "section": "A",
    "dateOfBirth": "2011-04-12T00:00:00.000Z",
    "academicsPct": 88.5,
    "punctualityPct": 92.0,
    "behaviourScore": 4.5,
    "isUnderperformer": false,
    "underperformerDims": []
  }
]
```

---

## 5. Assessment & Marks History
A student's academic progress. Under `studentMarksHistoryProvider`, 6 test marks records are procedurally generated over the past 30 days.

* **Payload Structure:**
```json
[
  {
    "date": "2026-05-18T16:24:00.000Z",
    "title": "Chapter Test 1",
    "subject": "Mathematics",
    "score": 22.0,
    "maxMarks": 25.0,
    "percentage": 88.0
  },
  {
    "date": "2026-05-13T16:24:00.000Z",
    "title": "Unit Test 2",
    "subject": "Science",
    "score": 76.0,
    "maxMarks": 100.0,
    "percentage": 76.0
  }
]
```

---

## 6. Daily Attendance Logs
Under `studentAttendanceHistoryProvider`, a 30-day chronological report of school-day attendance statuses is populated.

* **Payload Structure:**
```json
[
  { "date": "2026-05-21T00:00:00.000Z", "status": "Present" },
  { "date": "2026-05-20T00:00:00.000Z", "status": "Present" },
  { "date": "2026-05-19T00:00:00.000Z", "status": "Late" },
  { "date": "2026-05-18T00:00:00.000Z", "status": "Absent" }
]
```
* **Supported `status` fields:** `Present` | `Absent` | `Late`

---

## 7. Behaviour Log History & Dynamic Submissions
Chronological behavioral entries populated under `studentBehaviourProvider`. Tapping dynamic buttons updates this list in real-time.

* **Payload Structure:**
```json
[
  {
    "id": "log_student_101_0",
    "studentId": "student_101",
    "enteredBy": "t1",
    "preset": {
      "label": "Helpful",
      "category": "positive"
    },
    "createdAt": "2026-05-21T16:25:00.000Z"
  },
  {
    "id": "log_student_101_1",
    "studentId": "student_101",
    "enteredBy": "t1",
    "preset": {
      "label": "Inattentive in class",
      "category": "negative"
    },
    "createdAt": "2026-05-14T16:24:00.000Z"
  }
]
```

### Pre-defined Behaviour Preset Presets:
* **Positive (`+` category):** `Helpful`, `Leadership`, `Active participation`, `Cooperative team player`
* **Negative (`-` category):** `Homework incomplete`, `Late arrival`, `Disruptive`, `Inattentive in class`
