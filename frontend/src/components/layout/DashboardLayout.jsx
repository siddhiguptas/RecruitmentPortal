import Sidebar from "../Sidebar";

function DashboardLayout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  content: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#f3f4f6",
  },
};

export default DashboardLayout;