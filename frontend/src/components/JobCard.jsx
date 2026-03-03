import { useNavigate } from "react-router-dom";

function JobCard({ title, company, location }) {
  const navigate = useNavigate();   // 🔥 THIS WAS MISSING

  return (
    <div className="job-card">
      <h3>{title}</h3>
      <p><strong>Company:</strong> {company}</p>
      <p><strong>Location:</strong> {location}</p>

      <button
        className="apply-btn"
        onClick={() => navigate("/apply")}
      >
        Apply Now
      </button>
    </div>
  );
}

export default JobCard;