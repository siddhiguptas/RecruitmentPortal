import { useState } from "react";

function Apply() {
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files allowed!");
      setResume(null);
      return;
    }

    setError("");
    setResume(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!resume) {
      alert("Please upload resume");
      return;
    }

    alert("Resume submitted successfully!");
  };

  return (
    <div className="form-container">
      <h2>Upload Resume</h2>

      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />

        {resume && (
          <p style={{ marginTop: "10px" }}>
            Selected File: {resume.name}
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default Apply;