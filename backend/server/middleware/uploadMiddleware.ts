import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // For recruiters uploading photos/logos, we place them in /uploads 
    // For students uploading resumes, we place them in /uploads/resumes
    // To handle both, we will just use the root /uploads dir, or /uploads/resumes for pdfs
    
    let uploadPath = path.resolve(process.cwd(), "uploads");
    if (file.mimetype === "application/pdf") {
      uploadPath = path.join(uploadPath, "resumes");
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${req.user?._id || 'unknown'}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req: any, file: any, cb: any) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(`File format is not allowed: ${file.originalname}`) as any, false);
  },
});
