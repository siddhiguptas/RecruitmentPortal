function CandidateCard({ name, email, skills }) {
  return (
    <div style={styles.card}>
      <h3>{name}</h3>
      <p>{email}</p>
      <p><b>Skills:</b> {skills}</p>
      <button style={styles.btn}>View Resume</button>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  btn: {
    marginTop: "10px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
  },
};

export default CandidateCard;