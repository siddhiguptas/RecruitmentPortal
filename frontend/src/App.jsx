import Apply from "./pages/Apply";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

import "./styles/global.css";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<Apply />} />
        {/* Protected Route */}
        <Route
  path="/admin"
  element={
    user && user.role === "admin"
      ? <AdminDashboard />
      : <Navigate to="/login" />
  }
/>
      </Routes>

      <Footer />
    </>
  );
}

export default App;