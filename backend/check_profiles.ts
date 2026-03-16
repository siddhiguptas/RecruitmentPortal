import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://siddhiguptas107:RecruitmentPortal11@cluster0.evlwocj.mongodb.net/recruitment")
  .then(async () => {
    console.log("Connected to MongoDB");
    // Get all student profiles with their skills, cgpa, experience
    const db = mongoose.connection.db;
    const profiles = await db.collection("studentprofiles").find({}).toArray();
    
    console.log("------------- STUDENT PROFILES -------------");
    profiles.forEach(p => {
      console.log(JSON.stringify({
        id: p._id,
        user: p.user,
        skills: p.skills,
        cgpa: p.cgpa,
        experience: p.experience,
        parsedData: p.parsedResumeData ? {
           skills: p.parsedResumeData.skills,
           cgpa: p.parsedResumeData.cgpa,
           exp: p.parsedResumeData.experience_years
        } : null
      }, null, 2));
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
