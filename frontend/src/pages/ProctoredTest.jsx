function ProctoredTest() {
  return (
    <div>

      <h2>Online Assessment</h2>

      <p>Camera monitoring will be enabled during the test.</p>

      <button style={styles.btn}>Start Test</button>

    </div>
  );
}

const styles = {
btn:{
background:"red",
color:"white",
padding:"10px 20px",
border:"none"
}
}

export default ProctoredTest;