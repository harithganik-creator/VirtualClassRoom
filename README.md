# Virtual Classroom – LearnConnect

A modern, responsive, full-stack educational SaaS web application designed for interactive virtual classrooms, live video lectures, coursework submissions, and academic grading.

---

## 🌟 Key Features

- **Live Video Classrooms (Jitsi Meet)**: Browser-based, high-definition video conferencing directly inside the platform with unique generated room IDs.
- **Three Distinct User Roles**:
  - **Student**: View enrolled classes, join with classroom codes, attend live video meetings, download study notes, submit assignments, view marks & feedback.
  - **Teacher**: Create and manage classrooms, schedule live lectures, upload PDF notes & worksheets, create assignments with deadlines, grade submissions with feedback.
  - **Admin**: System-wide dashboard metrics, user account management (activate/suspend/delete), audit classrooms, and platform compliance.
- **Assignment Lifecycle & Grading**: Document uploads, automated late submission detection, points evaluation, and feedback messaging.
- **Study Materials & Cloud Uploads**: Cloudinary-powered PDF and document sharing with instant download links.
- **Real-Time Notification Alerts**: Instant in-app alerts for newly posted assignments, upcoming lectures, and grading updates.
- **Modern SaaS UI**: Styled using Tailwind CSS with responsive sidebar navigation, interactive statistics cards, Recharts data charts, and toast notifications.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v6
- **State & API**: React Context API, Axios with JWT interceptors
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Conferencing**: `@jitsi/react-sdk`
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Date Utilities**: Date-fns

### Backend
- **Runtime**: Node.js & Express.js
- **Architecture**: Modular REST API (Controllers, Routes, Models, Middleware)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Uploads**: Multer & Cloudinary
- **Security**: Helmet, CORS, Express-Rate-Limit, Cookie-Parser, Morgan

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string
- (Optional) **Cloudinary** credentials for cloud file storage

---

### 2. Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/virtual-classroom
   JWT_SECRET=learnconnect_super_secret_jwt_key_2026_dev
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   ```

4. Seed the database with sample classrooms, teachers, and students:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `client/.env` has the correct API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client runs at `http://localhost:5173`.*

---

## 🔑 Demo Seed Accounts

Run `npm run seed` in the `server` directory to populate the database with these pre-configured test accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@learnconnect.com` | `admin123` | Full system control, user moderation, analytics |
| **Teacher** | `sarah@learnconnect.com` | `teacher123` | Course instructor (CS & Algorithms) |
| **Teacher** | `michael@learnconnect.com` | `teacher123` | Course instructor (Physics & Mechanics) |
| **Student** | `alice@student.com` | `student123` | Enrolled in CS and Physics courses |
| **Student** | `bob@student.com` | `student123` | Enrolled in CS course |

---

## 📡 API Endpoint Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (Student or Teacher)
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Fetch currently authenticated user
- `POST /api/auth/logout` - Invalidate session cookie

### Classrooms (`/api/classrooms`)
- `GET /api/classrooms` - List classrooms (role-filtered)
- `POST /api/classrooms` - Create classroom (Teacher only)
- `GET /api/classrooms/:id` - Get classroom details
- `PUT /api/classrooms/:id` - Update classroom details
- `DELETE /api/classrooms/:id` - Delete classroom
- `POST /api/classrooms/join` - Join via 8-character invitation code
- `DELETE /api/classrooms/:id/students/:studentId` - Remove enrolled student

### Live Sessions (`/api/classes`)
- `GET /api/classes` - List scheduled sessions
- `POST /api/classes` - Schedule session with Jitsi room ID
- `PUT /api/classes/:id` - Update scheduled session
- `DELETE /api/classes/:id` - Cancel and delete session
- `POST /api/classes/:id/join` - Record participant attendance

### Materials & Notes (`/api/materials`)
- `GET /api/materials` - List documents for classroom
- `POST /api/materials` - Upload PDF/handout
- `DELETE /api/materials/:id` - Remove material

### Assignments & Grading (`/api/assignments`)
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get details & student submission
- `POST /api/assignments/:id/submit` - Turn in solution file
- `PUT /api/assignments/:id/grade` - Grade submission with marks & feedback

### Announcements (`/api/announcements`)
- `GET /api/announcements` - List classroom notices
- `POST /api/announcements` - Publish announcement
- `DELETE /api/announcements/:id` - Remove announcement

### Admin Management (`/api/admin`)
- `GET /api/admin/dashboard` - Platform statistics
- `GET /api/admin/users` - Paginated user management
- `PUT /api/admin/users/:id/status` - Update account status (`active`, `suspended`, `inactive`)
- `DELETE /api/admin/users/:id` - Delete account

---

## 📄 License
This project is licensed under the MIT License.
