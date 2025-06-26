import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabaseAdmin } from '../../db/index.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `protest-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Extend Request interface to include file property
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Image upload endpoint - Automatically links images to Supabase storage
router.post('/image', upload.single('image'), async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Generate unique filename with protest prefix
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `protest-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    
    // Upload to Supabase protest-images bucket
    const { data, error } = await supabaseAdmin.storage
      .from('protest-images')
      .upload(uniqueFileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'Failed to upload image to storage' });
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabaseAdmin.storage
      .from('protest-images')
      .getPublicUrl(uniqueFileName);

    // Clean up local temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('Image uploaded to Supabase storage:', uniqueFileName);
    res.json({ 
      message: 'Image uploaded successfully',
      image_url: urlData.publicUrl,
      filename: uniqueFileName
    });
  } catch (error) {
    console.error('Image upload error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;