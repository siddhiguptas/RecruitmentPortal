import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, BarChart, Video } from "lucide-react";

function Sidebar({ role }) {

  if (!role) return null; // safety

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>
        {role.toUpperCase()} PANEL
      </h2>

      <div style={styles.menu}>

        {role === "student" && (
          <>
            <NavLink to="resume" style={styles.link} className={({isActive}) => isActive ? "active-link" : ""}>
              <FileText size={18} /> Resume
            </NavLink>

            <NavLink to="recommended" style={styles.link}>
              <LayoutDashboard size={18} /> Jobs
            </NavLink>

            <NavLink to="test" style={styles.link}>
              <Video size={18} /> Test
            </NavLink>
          </>
        )}

        {role === "recruiter" && (
          <NavLink to="dashboard" style={styles.link}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
        )}

        {role === "admin" && (
          <NavLink to="analytics" style={styles.link}>
            <BarChart size={18} /> Analytics
          </NavLink>
        )}

      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #1e3a8a, #2563eb)",
    color: "white",
    padding: "25px",
  },
  title: {
    marginBottom: "30px",
    fontSize: "20px",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "white",
    fontSize: "15px",
  }
};

export default Sidebar;