import DashboardLayout from "../layouts/DashboardLayout";
import { Routes, Route } from "react-router-dom";
import ResumeUpload from "./ResumeUpload";
import RecommendedJobs from "./RecommendedJobs";
import ProctoredTest from "./ProctoredTest";
import DashboardLayout from "../components/layout/DashboardLayout";

function StudentDashboard() {
  return (
    <DashboardLayout>
      <h1>Student Dashboard</h1>

      <div style={styles.section}>
        <h3>Applied Jobs</h3>
        <p>Software Engineer - Pending</p>
        <p>Backend Developer - Shortlisted</p>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  section: {
    marginTop: "20px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
  },
};

function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <Routes>
        <Route path="resume" element={<ResumeUpload />} />
        <Route path="recommended" element={<RecommendedJobs />} />
        <Route path="test" element={<ProctoredTest />} />
      </Routes>
    </DashboardLayout>
  );
}

export default StudentDashboard;