import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div>

      {/* HERO SECTION */}
      <section className="hero fade-in">
        <h1>AI Powered Recruitment Portal</h1>
        <p>Connecting Talent with Opportunity</p>

        <div className="hero-buttons">
          <button
            className="btn"
            onClick={() => navigate("/jobs")}
          >
            Browse Jobs
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </section>


      {/* FEATURES */}
      <section className="features fade-in">

        <div className="feature-card">
          <h3>Smart Hiring</h3>
          <p>AI-based resume screening system to match candidates with jobs.</p>
        </div>

        <div className="feature-card">
          <h3>Internships</h3>
          <p>Students can easily track and apply for internships.</p>
        </div>

        <div className="feature-card">
          <h3>Campus Drives</h3>
          <p>Recruiters can manage campus hiring drives efficiently.</p>
        </div>

        <div className="feature-card">
          <h3>Online Tests</h3>
          <p>Conduct proctored assessments directly on the portal.</p>
        </div>

      </section>


      {/* STATS SECTION */}
      <section className="stats fade-in">

        <div className="stat-card">
          <h2>500+</h2>
          <p>Students Registered</p>
        </div>

        <div className="stat-card">
          <h2>100+</h2>
          <p>Companies</p>
        </div>

        <div className="stat-card">
          <h2>300+</h2>
          <p>Jobs Posted</p>
        </div>

        <div className="stat-card">
          <h2>250+</h2>
          <p>Successful Placements</p>
        </div>

      </section>


      {/* CTA SECTION */}
      <section className="cta fade-in">

        <h2>Start Your Career Journey Today</h2>
        <p>Join thousands of students and recruiters using our platform.</p>

        <button
          className="btn"
          onClick={() => navigate("/register")}
        >
          Register Now
        </button>

      </section>

    </div>
  );
}

export default Home;