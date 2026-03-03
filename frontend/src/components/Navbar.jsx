import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Recruitment Portal</h2>

      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/jobs" style={styles.link}>Jobs</Link>

        {!user ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        ) : (
          <>
            {user.role === "admin" && (
              <Link to="/admin" style={styles.link}>Dashboard</Link>
            )}
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "linear-gradient(to right, #1e3a8a, #2563eb)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#1e3a8a",
    color: "white",
  },
  logo: { margin: 0 },
  link: {
    marginLeft: "20px",
    textDecoration: "none",
    color: "white",
    fontWeight: "500",
  },
  logoutBtn: {
    marginLeft: "20px",
    background: "red",
    color: "white",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
  }
};

export default Navbar;