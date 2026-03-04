import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Moon, Sun } from "lucide-react";

function Navbar() {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Recruitment Portal</h2>

      {/* Mobile Toggle */}
      <div className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            {user.role === "admin" && (
              <Link to="/admin">Dashboard</Link>
            )}
            {user.role === "student" && (
              <Link to="/student">Dashboard</Link>
            )}
            {user.role === "recruiter" && (
              <Link to="/recruiter">Dashboard</Link>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {/* Dark Mode Toggle */}
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;