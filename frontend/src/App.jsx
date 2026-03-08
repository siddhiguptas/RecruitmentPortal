import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import Apply from "./pages/Apply";

import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ResumeUpload from "./pages/ResumeUpload";
import RecommendedJobs from "./pages/RecommendedJobs";
import ProctoredTest from "./pages/ProctoredTest";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />

      <Routes>

        {/* Redirect to login */}
        <Route path="/" element={<Navigate to="/login"/>}/>

        {/* Auth */}
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        {/* Public */}
        <Route path="/jobs" element={<Jobs/>}/>
        <Route path="/apply" element={<Apply/>}/>

        {/* Student */}
        <Route path="/student/*" element={
          user?.role==="student" ? <StudentDashboard/> : <Navigate to="/login"/>
        }/>

        <Route path="/student/resume" element={<ResumeUpload/>}/>
        <Route path="/student/recommended" element={<RecommendedJobs/>}/>
        <Route path="/student/test" element={<ProctoredTest/>}/>

        {/* Recruiter */}
        <Route path="/recruiter" element={
          user?.role==="recruiter" ? <RecruiterDashboard/> : <Navigate to="/login"/>
        }/>

        {/* Admin */}
        <Route path="/admin" element={
          user?.role==="admin" ? <AdminDashboard/> : <Navigate to="/login"/>
        }/>

        <Route path="/analytics" element={<PredictiveAnalytics/>}/>

      </Routes>

      <Footer />
    </>
  );
}

export default App;