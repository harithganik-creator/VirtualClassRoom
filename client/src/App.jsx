import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Public & Auth Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Dashboard & Core Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClassroomsPage from './pages/classrooms/ClassroomsPage';
import CreateClassroomPage from './pages/classrooms/CreateClassroomPage';
import ClassroomDetailPage from './pages/classrooms/ClassroomDetailPage';
import JoinClassroomPage from './pages/classrooms/JoinClassroomPage';
import LiveClassPage from './pages/live/LiveClassPage';
import SchedulePage from './pages/schedule/SchedulePage';
import MaterialsPage from './pages/materials/MaterialsPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import GradingPage from './pages/assignments/GradingPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminClassroomsPage from './pages/admin/AdminClassroomsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Pages (with AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Aliases for /auth/* */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Full-screen Live Video Classroom */}
      <Route
        path="/live/:classId"
        element={
          <ProtectedRoute>
            <LiveClassPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard & App Routes (with DashboardLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard route (dynamically chooses student/teacher/admin) */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Classroom Routes */}
        <Route path="/classrooms" element={<ClassroomsPage />} />
        <Route
          path="/classrooms/create"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <CreateClassroomPage />
            </ProtectedRoute>
          }
        />
        <Route path="/classrooms/:id" element={<ClassroomDetailPage />} />
        <Route
          path="/join"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <JoinClassroomPage />
            </ProtectedRoute>
          }
        />

        {/* Schedule & Live Calendar */}
        <Route path="/schedule" element={<SchedulePage />} />

        {/* Materials */}
        <Route path="/materials" element={<MaterialsPage />} />

        {/* Assignments */}
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
        <Route
          path="/assignments/:id/grade"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <GradingPage />
            </ProtectedRoute>
          }
        />

        {/* Announcements */}
        <Route path="/announcements" element={<AnnouncementsPage />} />

        {/* User Profile & Account */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classrooms"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminClassroomsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* System Error & Fallback Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
