# 🏫 Sikshalaya — School Management Platform

A full-stack school management system with a **React admin panel**, **Node.js REST API**, and a **Flutter teacher mobile app**.

---

## 📦 Project Structure

```
Sikshalaya/
├── src/                  # React admin panel (Vite)
│   ├── pages/            # PrincipalAdmin, SuperAdmin, Login, etc.
│   ├── components/       # Sidebar and shared UI
│   ├── api/              # Axios API client
│   └── contexts/         # AuthContext (JWT session)
│
├── server/               # Node.js + Express REST API
│   ├── controllers/      # Business logic per resource
│   ├── models/           # Sequelize ORM models
│   ├── routes/           # Express route definitions
│   ├── middleware/        # JWT auth, validation
│   ├── services/         # Email, metrics services
│   └── scripts/          # DB seed scripts
│
└── mobile/               # Flutter teacher mobile app
    └── lib/
        └── features/     # attendance, marks, auth, home, insights…
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Admin Panel | React 18 + Vite + React Router |
| Backend API | Node.js + Express + Sequelize ORM |
| Database | SQLite (dev) / MySQL (production) |
| Auth | JWT (HTTP-only cookies) |
| Mobile App | Flutter (Dart) |
| API Docs | Swagger UI (`/api-docs`) |

---

## ✨ Features

### 🖥️ Admin Panel (Principal / Super Admin)
- **Dashboard** — live KPIs: students, attendance %, marks pending, fee outstanding
- **Students** — add/edit/delete, underperformer flagging (< 75% in any dimension)
- **Teachers** — invite, manage, assign to classes
- **Classes & Sections** — create classes, assign class teachers, manage subjects
- **Attendance** — mark/view daily attendance, auto-syncs with mobile app every 30s
- **Marks & Results** — track assessment entry progress by subject
- **Curriculum** — chapter-wise progress tracking
- **Notices** — broadcast notices to teachers/parents
- **Reports** — attendance trends, export CSV
- **Settings** — academic year, pass marks, performance thresholds
- **Super Admin** — multi-school overview, branch management, permissions

### 📱 Mobile App (Teacher)
- Login with OTP / email+password
- Mark attendance per class
- Enter marks for assessments
- View class roster and student profiles
- Receive push notifications
- Insights & behaviour logs

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- Flutter SDK 3.x
- Git

---

### 1. Clone the repo

```bash
git clone https://github.com/KK13221/Sikshalaya.git
cd Sikshalaya
```

---

### 2. Backend API

```bash
cd server
cp .env.example .env
# Edit .env with your values (see below)
npm install
npm run seed      # seed initial data
npm run dev       # starts on http://localhost:5000
```

**`server/.env` variables:**

```env
PORT=5000
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174
NODE_ENV=development
```

> Swagger API docs available at: `http://localhost:5000/api-docs`

---

### 3. Admin Panel

```bash
# from project root
npm install
npm run dev       # starts on http://localhost:5174
```

Or run both together:
```bash
npm start         # runs admin panel + backend concurrently
```

---

### 4. Flutter Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

> Make sure the API base URL in `mobile/lib/config/` points to your server (e.g. `http://10.0.2.2:5000` for Android emulator).

---

## 👥 Roles

| Role | Access |
|---|---|
| `superadmin` | Full access across all schools/branches |
| `principal` | Full access within their branch |
| `teacher` | Mobile app — attendance & marks for assigned class |

---

## 📂 Key Scripts

```bash
npm run seed          # Seed database with sample data
npm run build         # Build admin panel for production
```

---

## 🔒 Security Notes

- `.env` files are **git-ignored** — never commit secrets
- APK / IPA build files are **git-ignored** — distribute via Play Store / TestFlight
- SQLite dev DB is **git-ignored** — use MySQL in production

---

## 📄 License

Private — All rights reserved © Sikshalaya Global
