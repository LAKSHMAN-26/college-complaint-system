# 🎓 CampusResolve — College Grievance & Complaint Management System

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application designed for educational institutions to digitize, route, triage, and resolve campus-wide complaints across academic, hostel, and infrastructure facilities.

---

## 🌟 Key Features

### 1. 👥 Three-Tier Role-Based Access Control (RBAC)
- **Student**:
  - Register & authenticate securely with JWT.
  - File detailed complaints with category, location, priority hint, and up to 5 attachments (images/PDFs).
  - Track live visual status history timelines and audit logs.
  - Interactive discussion threads on each ticket.
  - Close resolved tickets with a 1–5 star satisfaction rating and review.
  - Reopen tickets with detailed justifications if issues persist.
- **Staff / Technician**:
  - Dedicated console with tickets assigned to their department or account.
  - Transition ticket status to `IN_PROGRESS`.
  - Add technical updates and internal staff notes.
  - Mark tickets as `RESOLVED` with resolution summaries and proof photos.
- **Administrator**:
  - Executive analytics dashboard powered by **Recharts** (Volume, Monthly Trends, Priority distribution, Category breakdown, Mean Time to Repair).
  - Search & multi-filter across all campus tickets.
  - Triage and route tickets by assigning functional departments and staff technicians.
  - Manage lifecycle statuses and severity levels.
  - Full CRUD management of campus departments and staff accounts.

### 2. 🔄 Complaint Lifecycle Workflow
Strict business rules govern status transitions:
```
[ SUBMITTED ] ──> [ UNDER_REVIEW ] ──> [ ASSIGNED ] ──> [ IN_PROGRESS ] ──> [ RESOLVED ] ──> [ CLOSED ]
      │                                                                           ▲
      └──> [ REJECTED ] (with admin reason)                                       │
                                                [ REOPENED ] ─────────────────────┘
```

### 3. ⏱️ Status History Audit Trail & Real-time Notifications
Every lifecycle transition automatically logs the timestamp, actor (Student, Staff, Admin), and remarks into a timeline audit trail, triggering in-app notification alerts.

### 4. 📁 Dual File Upload Engine
Multer upload engine with automatic support for **Local Disk Storage** (`/uploads` static directory) and **Cloudinary** cloud storage if credentials are configured.

### 5. ⚡ 1-Click Demo Login Switcher
Pre-built top switcher bar allowing evaluators and presentation reviewers to switch between **Admin**, **IT Staff**, **Maintenance Staff**, and **Students** with a single click.

---

## 📦 Packages & Technologies Used

### Backend Dependencies (`server/package.json`)
| Package | Purpose & Justification |
| :--- | :--- |
| `express` | Core web framework for REST API routing and middleware pipeline |
| `mongoose` | MongoDB Object Data Modeling (ODM) with validation & relations |
| `jsonwebtoken` | Secure stateless JWT token creation and verification |
| `bcryptjs` | Salted password hashing for credential security |
| `multer` | Multi-part form-data handler for file & image uploads |
| `cloudinary` | Cloud media management with automatic local disk fallback |
| `cors` | Cross-Origin Resource Sharing enablement for Vite dev server |
| `dotenv` | Environment variable isolation (`.env`) |
| `helmet` | HTTP security headers |
| `morgan` | HTTP request logging for development |
| `compression` | Gzip compression for optimized API payloads |
| `nodemon` *(dev)* | Auto-reloading development server |

### Frontend Dependencies (`client/package.json`)
| Package | Purpose & Justification |
| :--- | :--- |
| `react` & `react-dom` | Reactive component UI library (React 18) |
| `vite` | Next-generation fast build tool and HMR dev server |
| `react-router-dom` | Client-side declarative routing with protected role guards |
| `axios` | Promise-based HTTP client with automatic JWT header interceptors |
| `tailwindcss` | Modern utility-first styling with custom glassmorphism |
| `lucide-react` | Vector icon library for clean visual cues |
| `recharts` | Composable analytics charts (Area, Bar, Pie/Donut) |
| `react-hot-toast` | Animated toast feedback notifications |
| `clsx` & `tailwind-merge` | Conditional class manipulation utilities |

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18.x or higher) -> [Download Node.js](https://nodejs.org)
- **MongoDB** (Local Community Server running or MongoDB Atlas URI) -> [Download MongoDB](https://www.mongodb.com/try/download/community)

---

### 2. Installation

1. Open your terminal in the root project folder:
   ```bash
   cd "c:\management system"
   ```

2. Install all root, server, and client packages:
   ```bash
   npm run install:all
   ```
   *(Or individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

---

### 3. Environment Configuration

Check `server/.env`. By default, local MongoDB and local file uploads work out of the box:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/college_complaint_db
JWT_SECRET=super_secret_campus_resolve_jwt_key_2026_secure
JWT_EXPIRE=7d

# Optional Cloudinary (Leave empty for automatic local /uploads disk storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

### 4. Seed Database with Demo Accounts & Sample Tickets

Run the automated seeder to populate sample departments, staff technicians, students, tickets, and timelines:
```bash
npm run seed
```

---

### 5. Running the Application Locally

You can run both the **Backend API** and **React Frontend** concurrently with one command:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Preconfigured Demo Accounts

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Dr. Rajesh Sharma | `admin@campus.edu` | `Admin@123` | Full analytics, triage, routing, department & staff CRUD |
| **STAFF (IT)** | Ravi Verma | `itstaff@campus.edu` | `Staff@123` | IT Support queue, status progress, resolve tickets |
| **STAFF (Civil)** | Suresh Kumar | `maintenancestaff@campus.edu` | `Staff@123` | Maintenance queue, resolve tickets |
| **STUDENT 1** | Laxman Kumar (CSE) | `student@campus.edu` | `Student@123` | Submit complaints, view history, rate resolution |
| **STUDENT 2** | Priya Sharma (ECE) | `student2@campus.edu` | `Student@123` | Submit complaints, view history, reopen tickets |

> 💡 **Tip**: Use the **1-Click Demo Bar** at the top of the webpage to switch between accounts instantly without typing passwords!

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a student account
- `POST /api/auth/login` — Login & receive JWT token
- `GET  /api/auth/me` — Get current user profile
- `PUT  /api/auth/profile` — Update profile/password

### Student Complaints
- `POST  /api/complaints` — Submit a complaint with file uploads
- `GET   /api/complaints/my` — Get paginated/filtered list of student's complaints
- `GET   /api/complaints/:id` — View full complaint details, timeline & discussion
- `PATCH /api/complaints/:id/close` — Close complaint with feedback rating (1-5) & review
- `PATCH /api/complaints/:id/reopen` — Reopen unresolved complaint with reason

### Admin & Staff Management
- `GET   /api/admin/statistics` — Get analytics metrics and chart data
- `GET   /api/admin/complaints` — Filter & search all campus complaints
- `PATCH /api/admin/complaints/:id/assign` — Route ticket to department & technician
- `PATCH /api/admin/complaints/:id/status` — Update status (`UNDER_REVIEW`, `IN_PROGRESS`, `REJECTED`, etc.)
- `PATCH /api/admin/complaints/:id/priority` — Change severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `PATCH /api/admin/complaints/:id/resolve` — Mark resolved with resolution remarks & proof photos
- `GET   /api/admin/staff` — List all staff technicians
- `POST  /api/admin/staff` — Create new staff account
- `PUT   /api/admin/staff/:id` — Update staff details & department linkage

### Departments
- `GET    /api/departments` — List active departments
- `POST   /api/departments` — Create new department *(Admin)*
- `PUT    /api/departments/:id` — Update department details *(Admin)*
- `DELETE /api/departments/:id` — Deactivate department *(Admin)*

### Comments & Notifications
- `GET   /api/complaints/:id/comments` — Get conversation thread
- `POST  /api/complaints/:id/comments` — Add comment or internal staff note
- `GET   /api/notifications` — Get current user notifications
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

---

## 📂 Project Architecture

```
college-complaint-system/
├── package.json
├── README.md
├── server/
│   ├── config/ (db.js, cloudinary.js)
│   ├── controllers/ (auth, complaint, admin, department, comment, notification)
│   ├── middleware/ (auth, role, upload, error)
│   ├── models/ (User, Department, Complaint, StatusHistory, Comment, Notification)
│   ├── routes/ (auth, complaint, admin, department, comment, notification)
│   ├── seed/ (seedData.js)
│   ├── uploads/ (Local file storage)
│   ├── app.js & server.js
│   └── .env
└── client/
    ├── src/
    │   ├── components/ (Navbar, Sidebar, StatsCard, StatusTimeline, FileUpload, etc.)
    │   ├── context/ (AuthContext, NotificationContext)
    │   ├── pages/ (auth, student, staff, admin)
    │   ├── services/ (api, authService, complaintService, departmentService)
    │   ├── utils/ (constants, helpers)
    │   ├── App.jsx & main.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── vite.config.js
```
