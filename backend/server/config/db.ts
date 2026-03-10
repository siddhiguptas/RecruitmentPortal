import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/recruitment_portal";
  
  if (uri.includes("<password>")) {
    console.error("CRITICAL: Your MONGO_URI contains the '<password>' placeholder. Please replace it with your actual password in the Secrets panel.");
    throw new Error("MONGO_URI contains <password> placeholder");
  }

  console.log(`Attempting to connect to MongoDB at: ${uri.split('@').pop()}`); // Log host only for security
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('auth failed') || error.message.includes('bad auth')) {
      console.error("CRITICAL: MongoDB authentication failed. This usually means your username or password in MONGO_URI is incorrect.");
    } else if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.error("CRITICAL: Could not connect to the MongoDB host. Check your network or the cluster URL in MONGO_URI.");
      console.error("7. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access from Anywhere).");
    }
    
    throw error; // Rethrow to let server.ts handle it
  }
};
