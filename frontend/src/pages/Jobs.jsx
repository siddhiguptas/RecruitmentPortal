import { useState } from "react";
import JobCard from "../components/JobCard";

function Jobs() {
  const jobsData = [
    { id: 1, title: "Frontend Developer", company: "Infosys", location: "Bangalore" },
    { id: 2, title: "Backend Developer", company: "TCS", location: "Hyderabad" },
    { id: 3, title: "Data Analyst", company: "Wipro", location: "Gurgaon" },
    { id: 4, title: "React Developer", company: "Google", location: "Bangalore" },
  ];

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredJobs = jobsData.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) &&
    job.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Available Jobs</h2>

      {/* Search Section */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

      <div className="job-grid">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
            />
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No Jobs Found</p>
        )}
      </div>
    </div>
  );
}

export default Jobs;