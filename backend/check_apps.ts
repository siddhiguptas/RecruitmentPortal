import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://siddhiguptas107:RecruitmentPortal11@cluster0.evlwocj.mongodb.net/recruitment")
  .then(async () => {
    console.log("Connected to MongoDB for Applications verification...");
    const db = mongoose.connection.db;
    const apps = await db.collection("applications").find({}).toArray();
    
    console.log(`------------- ${apps.length} APPLICATIONS -------------`);
    apps.forEach(a => {
      console.log(`Job: ${a.job}, Student: ${a.student}, Match Score: float(${a.matchScore})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
