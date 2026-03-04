import DashboardLayout from "../components/layout/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1>Admin Dashboard</h1>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3>Total Jobs</h3>
          <p>12</p>
        </div>

        <div style={styles.card}>
          <h3>Total Recruiters</h3>
          <p>5</p>
        </div>

        <div style={styles.card}>
          <h3>Total Students</h3>
          <p>150</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "200px",
    textAlign: "center",
  },
};

export default AdminDashboard;