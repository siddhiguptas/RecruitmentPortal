import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero fade-in">
        <h1>AI Powered Recruitment Portal</h1>
        <p>Connecting Talent with Opportunity</p>
        <button
          className="btn"
          onClick={() => navigate("/jobs")}
        >
          Browse Jobs
        </button>
      </section>

      <section className="features fade-in">
        <div className="feature-card">
          <h3>Smart Hiring</h3>
          <p>AI-based resume screening system</p>
        </div>

        <div className="feature-card">
          <h3>Internships</h3>
          <p>Track and apply for internships easily</p>
        </div>

        <div className="feature-card">
          <h3>Campus Drives</h3>
          <p>Manage placement drives efficiently</p>
        </div>
      </section>
    </div>
  );
}

export default Home;