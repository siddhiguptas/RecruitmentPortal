/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentApplications from "./pages/StudentApplications";
import StudentRecommendedJobs from "./pages/StudentRecommendedJobs";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OnlineTest from "./pages/OnlineTest";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./hooks/useAuth";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="jobs" element={<StudentRecommendedJobs />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="tests" element={<div className="p-8"><h1 className="text-2xl font-bold">Online Tests</h1></div>} />
            <Route path="test/:testId" element={<OnlineTest />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/*"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="post-job" element={<div className="p-8"><h1 className="text-2xl font-bold">Post a Job</h1></div>} />
            <Route path="applicants" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Applicants</h1></div>} />
            <Route path="interviews" element={<div className="p-8"><h1 className="text-2xl font-bold">Interviews</h1></div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Students</h1></div>} />
            <Route path="recruiters" element={<div className="p-8"><h1 className="text-2xl font-bold">Manage Recruiters</h1></div>} />
            <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Platform Analytics</h1></div>} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
