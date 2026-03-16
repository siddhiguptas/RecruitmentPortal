import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://siddhiguptas107:RecruitmentPortal11@cluster0.evlwocj.mongodb.net/recruitment")
  .then(async () => {
    console.log("Connected to MongoDB for updating Applications match scores...");
    const db = mongoose.connection.db;
    
    // Wipe all cached match scores, forcing recruiter algorithms or frontend logic to recalculate 
    // Since recruiter dashboard uses rankCandidates which updates them anyway, this is safe.
    // The student dashboard pulls recommend-jobs which is dynamic, but applications use stored matchScore!
    
    const result = await db.collection("applications").updateMany(
      {},
      { $unset: { matchScore: "" } }
    );
    
    console.log(`Successfully wiped stored matchScores from ${result.modifiedCount} applications.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
