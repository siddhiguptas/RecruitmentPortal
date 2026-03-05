import { Routes, Route } from "react-router-dom";
import ResumeUpload from "./ResumeUpload";
import RecommendedJobs from "./RecommendedJobs";
import ProctoredTest from "./ProctoredTest";
import DashboardLayout from "../components/layout/DashboardLayout";

function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <Routes>
        <Route path="/" element={<h1>Welcome Student 👩‍💻</h1>} />
        <Route path="resume" element={<ResumeUpload />} />
        <Route path="recommended" element={<RecommendedJobs />} />
        <Route path="test" element={<ProctoredTest />} />
      </Routes>
    </DashboardLayout>
  );
}

export default StudentDashboard;