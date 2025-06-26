# Automated Image System for Protests

## Overview
The Corteo platform has a fully automated image system that handles protest image uploads and links them directly to the Supabase database without manual intervention.

## How It Works

### 1. Image Upload Process
When a user creates a protest and uploads an image:

1. **Frontend**: User selects image in the protest creation form
2. **Upload API**: Image is sent to `/api/upload/image` endpoint
3. **Supabase Storage**: Image is automatically stored in the `protest-images` bucket
4. **URL Generation**: Supabase generates a public URL for the image
5. **Database Link**: The image URL is automatically saved in the protest record

### 2. Automatic Linking
- Each uploaded image gets a unique filename: `protest-{timestamp}-{random}.{extension}`
- The image URL is immediately linked to the protest in the database
- No manual steps required - everything happens automatically

### 3. Image Display
- Protest cards automatically load images from Supabase storage
- Fallback images are provided if an image fails to load
- All images use proper Supabase storage URLs

## Technical Implementation

### Database Schema
```sql
-- In the protests table
image_url: text (nullable) -- Stores the full Supabase storage URL
```

### Storage Structure
```
Supabase Storage Bucket: protest-images
├── protest-1750926456895-183941396.jpg
├── protest-1750926789123-456789012.png
└── photo-1559827260-dc66d52bef19.jpeg (pre-existing)
```

### API Endpoints
- `POST /api/upload/image` - Uploads image to Supabase storage
- `POST /api/protests` - Creates protest with linked image URL

### Frontend Components
- `ProtestCard` - Displays images from Supabase storage
- `CreateProtest` - Handles image upload and protest creation

## Benefits
1. **Fully Automated**: No manual linking required
2. **Secure Storage**: Images stored in Supabase with proper access controls
3. **Scalable**: Can handle unlimited image uploads
4. **Reliable**: Built-in error handling and fallbacks
5. **Fast Loading**: Direct CDN access through Supabase

## User Experience
Users simply:
1. Click "Create New Protest" 
2. Fill out the form
3. Upload an image (optional)
4. Submit the form
5. Image is automatically linked and displayed in protest cards

The system handles all technical details automatically.