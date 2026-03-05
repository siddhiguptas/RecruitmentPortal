import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Apply from "./pages/Apply";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";

import "./styles/global.css";

function App() {
  const { user, theme } = useContext(AuthContext);

  return (
    <div className={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<Apply />} />
         <Route path="/recruiter" element={<RecruiterDashboard />} />
<Route path="/student" element={<StudentDashboard />} />
        {/* Admin Protected */}
        <Route
          path="/admin/*"
          element={
            user?.role === "admin"
              ? <AdminDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Student Protected */}
        <Route
          path="/student/*"
          element={
            user?.role === "student"
              ? <StudentDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Recruiter Protected */}
        <Route
          path="/recruiter/*"
          element={
            user?.role === "recruiter"
              ? <RecruiterDashboard />
              : <Navigate to="/login" />
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;