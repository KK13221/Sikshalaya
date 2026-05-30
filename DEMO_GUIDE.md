# Sikshalaya Global — Client Demo Guide

---

## Overview

The platform has **two parts**:

| Part | Technology | Who Uses It |
|---|---|---|
| Mobile App | Flutter (Android/iOS) | Teachers |
| Admin Panel | React Web | Principal / Admin |

Both connect to a shared backend server (Node.js + SQLite).

---

## Part 1 — Mobile App (Teacher Side)

### How to Add Marks

#### Step 1 — Open Marks Entry
- Teacher logs into the mobile app
- From the **Home / Today Dashboard**, tap **"Enter marks"**
- The **Marks Picker Screen** opens

#### Step 2 — Select Class and Test Type

| Test Type | Max Marks | When Used |
|---|---|---|
| Chapter Test | 25 | After every chapter |
| Class Test | 50 | Sample paper (teacher creates) |
| Unit Test | 100 | Every 3 months (scheduled) |
| Term Exam | 100 | End of term |

- Tap the **class** (e.g. Class 9-A)
- Tap the **test type**
- For **Chapter Test** — a list of chapters appears; chapters marked "In progress · ready" are eligible
- Tap **"Continue to marks entry →"**

#### Step 3 — Enter Marks for Each Student
- Each student appears in a card with their name and roll number
- Type the marks in the text box on the right
- If a student was **absent**, tap the **"A" button** — the marks box disappears and shows "Absent" in red
- Once all marks are filled, tap **"Submit assessment"**
- A green ✅ **"Marks submitted!"** confirmation appears

---

## Part 2 — Admin Panel (Principal / Admin Side)

### Login
- Open the web admin panel in a browser
- Login with Principal credentials
- The sidebar shows all available sections

---

### Section 1 — Dashboard

**What you see:**
- **5 KPI Cards** at the top:
  - Total Students enrolled
  - Total Teachers (active staff)
  - Attendance today (% present / total)
  - Pass rate (last assessment)
  - Branch rank (vs other branches)

- **Attendance Chart** — last 30 days trend line

- **Today Panel** — quick status:
  - How many classes have marked attendance
  - Which classes are missing attendance
  - How many teachers are in / on leave
  - Marks pending subjects

- **Subject-wise Pass Rate** — bar chart per subject (Term 1)
- **Teacher Activity** — progress bars showing each teacher's weekly activity

---

### Section 2 — Students

**What you can do:**

| Action | How |
|---|---|
| Add a student | Click **"+ Add student"** → fill the form → Save |
| Edit a student | Click **Edit** next to the student row |
| Delete a student | Click **Del** → confirm in popup |
| Search | Type name or admission number in the search box |
| Filter by class | Use the class dropdown at the top |
| Export list | Click **Export** → downloads a CSV file |

**Student Form Fields:**
Full name, Admission No., Roll No., Gender, Date of Birth, Class, Section, Guardian name/relation/phone/email, City, State

**"Needs Attention" Flag (⚠)**
- Any student who scores **below 75%** in Academics, Punctuality, or Behaviour is automatically flagged in red
- Switch to the **"⚠ Needs attention"** tab to see the filtered list
- Visible to both Teacher and Principal

---

### Section 3 — Teachers

**What you can do:**

| Action | How |
|---|---|
| Add a teacher | Click **"+ Add teacher"** → fill the form → Save |
| Edit a teacher | Click **Edit** |
| Delete a teacher | Click **Del** → confirm |
| Search | Type teacher name in the search box |

**Teacher Form Fields:**
Full name, Employee ID, Subjects (comma-separated), Experience (years), Qualification

---

### Section 4 — Classes & Sections

**What you can do:**
- Click **"+ New section"** to create a class (e.g. Class 9-A)
- Set the **Class name** (e.g. "Class 9"), **Section** (e.g. "A"), **Academic Year**
- Select which **subjects** are taught in that class (checkboxes)
- Edit or delete existing class sections
- Each class card shows the number of students enrolled

---

### Section 5 — Attendance

**How to mark attendance:**
1. Select a **date** (top right)
2. Select a **class** from the dropdown
3. All students in that class appear as tiles
4. Click a student tile to cycle through: **Present → Absent → Late → Present**
   - Present = green
   - Absent = red
   - Late = yellow
5. Counter at the top shows real-time Present / Absent / Late counts
6. Click **"Submit attendance"** to save

---

### Section 6 — Marks & Results

**Layout:**
- Left sidebar: choose assessment type (Chapter Test / Class Test / Unit Test / Term Exam)
- Top right: select a class
- Right panel shows:

**Entry Progress by Subject**
- Grid of subject cards showing how many assessments have been entered
- Green border = 100% done
- Yellow border = partially done
- Red border = not started

**All Assessments List**
- Lists every assessment for the selected class + type
- Shows: title, date, subject, max marks, status (active / completed / published)

**Publish Results**
- Once all marks are entered, click **"Publish results"** to make results visible

---

### Section 7 — Curriculum (Chapter Manager)

**How it works:**
- Select a class and subject
- See the full list of chapters for that class/subject
- Each chapter has a status:
  - **Upcoming** — not yet started
  - **In progress** — currently being taught (teacher can enter chapter test marks)
  - **Done** — chapter completed
- Principal/Admin can add new chapters with: Chapter number, Chapter name, Number of periods, Max marks

---

## Demo Flow (Suggested for Client Walkthrough)

```
1. Admin Panel → Dashboard
   Show the live KPI cards and attendance trend chart

2. Admin Panel → Classes
   Create a class section (e.g. Class 9-A) with subjects

3. Admin Panel → Students
   Add 2–3 students to the class
   Show search, filter, and export

4. Admin Panel → Attendance
   Select Class 9-A → mark 1 student absent → Submit
   Show the Present/Absent counter update in real time

5. Mobile App → Enter Marks
   Pick Class 9-A → Unit Test → enter marks → Submit
   Show the ✅ confirmation

6. Admin Panel → Marks & Results
   Select Class 9-A → Unit Test
   Show the subject entry progress updating

7. Admin Panel → Students → "Needs Attention" tab
   If any student is below 75%, show the red flag appearing automatically

8. Admin Panel → Dashboard
   Show branch rank and pass rate updating
```

---

## Key Points to Highlight to the Client

- **No double entry** — teacher enters marks once on mobile, principal sees it instantly in admin panel
- **Automatic flags** — system auto-detects underperforming students (below 75%) without any manual work
- **Role-based access** — teachers only see their classes; principal sees everything across the branch
- **Offline-friendly mobile** — marks can be entered even with slow connectivity
- **Export** — student data can be exported to CSV anytime

---

*Document prepared for Sikshalaya Global client demo — May 2026*
