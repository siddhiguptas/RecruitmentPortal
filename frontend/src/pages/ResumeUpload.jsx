function ResumeUpload() {
  return (
    <div className="card">
      <h3>Upload Resume</h3>
      <input type="file" />
      <br/><br/>
      <button className="btn-primary">Parse Resume</button>
    </div>
  );
}

export default ResumeUpload;