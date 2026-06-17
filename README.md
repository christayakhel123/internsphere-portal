# InternSphere 🌐

> The Ultimate Full-Stack Internship Finding Portal & Recruitment Management System.

InternSphere is a premium, modern, full-stack recruitment portal built to simplify the process of posting, searching, and managing internship listings. It features dual interactive dashboards: one tailored for candidates (students looking for jobs) and another for employers (managing listings and evaluating applications).

---

## 🚀 Key Features

### 👨‍🎓 Candidate Experience (Student Portal)
- **Interactive Listings**: Search, sort, and filter internship postings dynamically by keywords, job formats (Remote, Hybrid, On-site), and location.
- **Visual Application Tracker**: Check application statuses in real-time (`Pending`, `Reviewing`, `Interviewing`, `Accepted`, `Rejected`) with a clean horizontal milestone tracker.
- **Easy Resumes**: Upload PDF, Doc, or image resume files directly to the server, and write custom cover letters per application.

### 💼 Employer Experience (Recruiter Hub)
- **Analytics Dashboard**: Instant overview metrics calculating total postings, applicant count, review queues, and successful hires.
- **CRUD Postings**: Create, edit, and delete detailed job opportunity listings with format, stipend, location, duration, and requirements.
- **Recruitment Desk**: Review cover letters, download resume attachments, and update candidate stages dynamically via status chips.

### 🛡️ Core Infrastructure
- **Secure Access**: Role-based JWT authentication protecting endpoints on candidate and employer actions.
- **Glassmorphic UI**: Beautiful dark-mode-first aesthetic powered by HSL variables, Outfit/Inter typography, card hover scales, custom scrollbars, and keyframe slide animations.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Vanilla CSS (CSS Variables) + Lucide Icons
- **Backend**: Node.js + Express.js API
- **Database**: MySQL 8.0 (Workbench compatible)
- **Security**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **File System**: Local storage upload client (`multer`)

---

## 📁 Repository Structure

```text
├── database/
│   ├── schema.sql           # Database schema tables setup (MySQL)
│   └── seeds.sql            # Seed entries (sample users, jobs, applications)
├── backend/
│   ├── config/db.js         # Connection pool configurations
│   ├── middleware/          # Protected JWT and role-verification middleware
│   ├── routes/              # Auth, Jobs, and Application routers
│   ├── scripts/migrate.js   # Database migration and creation utility
│   ├── uploads/             # Server upload storage for resumes
│   ├── .env                 # Database credentials and secret key settings
│   └── server.js            # Express server configuration
└── frontend/                # React Vite user interfaces
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/      # Navbar, LandingPage, Auth, and Dashboard panels
    │   ├── App.css          # Layout and viewport configurations
    │   ├── App.jsx          # Route manager and authentication states
    │   ├── index.css        # Premium HSL styling system tokens
    │   └── main.jsx
    └── index.html
```

---

## ⚙️ Getting Started

### 1. Database Setup
Ensure you have a local instance of MySQL running on your system (standard port `3306`).
To automatically build and seed the database using our migration utility:
1. Open the backend configuration file `backend/.env`.
2. Update the credentials (`DB_PASSWORD`) to match your MySQL database password.
3. Open a terminal in the root folder and run:
   ```bash
   cd backend
   node scripts/migrate.js
   ```

### 2. Launch the Application
Open two terminal windows:

#### Terminal A: Start Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend server runs on:* `http://localhost:5000`

#### Terminal B: Start React client
```bash
cd frontend
npm install
npm run dev
```
*Frontend interface runs on:* `http://localhost:5173`

---

## 🔑 Test Credentials

Use these pre-configured accounts to log in and test candidate/employer roles (password for all seed accounts is **`password123`**):

### Candidate (Student) Accounts
* **Alex Mercer** — `alex@student.com`
* **Sarah Connor** — `sarah@student.com`

### Employer (Recruiter) Accounts
* **TechCorp HR** — `hr@techcorp.com`
* **DesignStudio Lead** — `lead@designstudio.com`
