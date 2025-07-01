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
    // Allow image files (JPEG, PNG, SVG, GIF, WebP)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/svg+xml',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, SVG, GIF, WebP)'));
    }
  }
});

// Extend Request interface to include file property
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// User avatar upload endpoint
router.post('/avatar', upload.single('avatar'), async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    // Generate unique filename with avatar prefix
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    
    // Upload to Supabase users-avatars bucket
    const { data, error } = await supabaseAdmin.storage
      .from('users-avatars')
      .upload(uniqueFileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'Failed to upload avatar to storage' });
    }

    // Get public URL for the uploaded avatar
    const { data: urlData } = supabaseAdmin.storage
      .from('users-avatars')
      .getPublicUrl(uniqueFileName);

    // Clean up local temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('Avatar uploaded to Supabase storage:', uniqueFileName);
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar_url: urlData.publicUrl,
      filename: uniqueFileName
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Protest image upload endpoint - Automatically links images to Supabase storage
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

// Background image upload endpoint
router.post('/background', upload.single('image'), async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No background image provided' });
    }

    // Generate unique filename with background prefix
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `background-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    
    // Upload to Supabase users-backgrounds bucket
    const { data, error } = await supabaseAdmin.storage
      .from('users-backgrounds')
      .upload(uniqueFileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'Failed to upload background to storage' });
    }

    // Get public URL for the uploaded background
    const { data: urlData } = supabaseAdmin.storage
      .from('users-backgrounds')
      .getPublicUrl(uniqueFileName);

    // Clean up local temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('Background image uploaded to Supabase storage:', uniqueFileName);
    res.json({ 
      message: 'Background image uploaded successfully',
      image_url: urlData.publicUrl,
      filename: uniqueFileName
    });
  } catch (error) {
    console.error('Background image upload error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload background image' });
  }
});

// What's New image upload endpoint - Supports SVG and PNG
router.post('/whats-new', upload.single('image'), async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Generate unique filename with whats-new prefix
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `whats-new-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    
    // Upload to Supabase whats-new bucket
    const { data, error } = await supabaseAdmin.storage
      .from('whats-new')
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
      .from('whats-new')
      .getPublicUrl(uniqueFileName);

    // Clean up local temporary file
    fs.unlinkSync(req.file.path);
    
    console.log('What\'s New image uploaded to Supabase storage:', uniqueFileName);
    res.json({ 
      message: 'What\'s New image uploaded successfully',
      image_url: urlData.publicUrl,
      filename: uniqueFileName
    });
  } catch (error) {
    console.error('What\'s New image upload error:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload What\'s New image' });
  }
});

export default router;