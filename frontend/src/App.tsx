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
import StudentTests from "./pages/StudentTests";
import TestAttempt from "./pages/TestAttempt";
import TestResults from "./pages/TestResults";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterPostJob from "./pages/RecruiterPostJob";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterApplications from "./pages/RecruiterApplications";
import RecruiterTests from "./pages/RecruiterTests";
import RecruiterProfile from "./pages/RecruiterProfile";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecruiters from "./pages/AdminRecruiters";
import AdminStudents from "./pages/AdminStudents";
import AdminTests from "./pages/AdminTests";
import AdminJobs from "./pages/AdminJobs";
import AdminAnalytics from "./pages/AdminAnalytics";

import OnlineTest from "./pages/OnlineTest";

import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
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
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="jobs" element={<StudentRecommendedJobs />} />
                  <Route path="applications" element={<StudentApplications />} />
                  <Route path="tests" element={<StudentTests />} />
                  <Route path="test-attempt/:attemptId" element={<TestAttempt />} />
                  <Route path="test-results/:attemptId" element={<TestResults />} />
                  <Route path="test/:testId" element={<OnlineTest />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/*"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <Routes>
                  <Route path="dashboard" element={<RecruiterDashboard />} />
                  <Route path="post-job" element={<RecruiterPostJob />} />
                  <Route path="jobs" element={<RecruiterJobs />} />
                  <Route path="applications" element={<RecruiterApplications />} />
                  <Route path="tests" element={<RecruiterTests />} />
                  <Route path="profile" element={<RecruiterProfile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="recruiters" element={<AdminRecruiters />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="tests" element={<AdminTests />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}