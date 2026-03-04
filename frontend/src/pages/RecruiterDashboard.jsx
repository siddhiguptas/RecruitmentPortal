import DashboardLayout from "../components/layout/DashboardLayout";

function RecruiterDashboard() {
  return (
    <DashboardLayout>
      <h1>Recruiter Dashboard</h1>

      <button style={styles.btn}>+ Post New Job</button>

      <div style={styles.section}>
        <h3>Your Posted Jobs</h3>
        <p>Software Engineer</p>
        <p>Frontend Developer</p>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  btn: {
    padding: "10px 15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  section: {
    marginTop: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
  },
};

export default RecruiterDashboard;