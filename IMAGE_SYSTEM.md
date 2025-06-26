# Automated Image System for Protests

## Overview
The Corteo platform uses a fully automated image system that links protest records directly to images stored in the Supabase storage bucket.

## Current Implementation

### Database Integration
All protests in the database now link to images stored in the `protest-images` Supabase bucket:

```
✓ 7 protests updated with Supabase bucket images
✓ All image_url fields now point to proper Supabase storage URLs
✓ Format: https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/{filename}
```

### Automatic Upload Process
When users create new protests:

1. **Image Selection**: User uploads image in protest creation form
2. **Storage Upload**: Image automatically saved to `protest-images` bucket with unique filename
3. **URL Generation**: Supabase generates public URL for immediate access
4. **Database Linking**: Image URL automatically saved in protest record's `image_url` field
5. **Display**: Protest cards immediately show the uploaded image

### Image Management
- **Unique Filenames**: `protest-{timestamp}-{random}.{extension}`
- **Automatic Cleanup**: Temporary files removed after upload
- **Error Handling**: Fallback images if upload fails
- **Type Validation**: Only image files accepted (jpg, png, gif, webp)

## Storage Structure
```
Supabase Bucket: protest-images
├── photo-1542601906990-b4d3fb778b09.jpeg
├── photo-1544717297-fa95b6ee9643.jpeg
├── photo-1559827260-dc66d52bef19.jpeg
├── photo-1569098644584-210bcd375b59.jpeg
├── photo-1571019613454-1cb2f99b2d8b.jpeg
├── photo-1573152958734-1922c188fba3.jpeg
└── teemu-paananen-rd5uNIUJCF0-unsplash.jpg
```

## API Endpoints
- `POST /api/upload/image` - Handles image upload to Supabase storage
- `POST /api/protests` - Creates protest with automatic image linking
- `GET /api/protests/*` - Returns protests with proper Supabase image URLs

## Benefits
1. **Zero Manual Work**: Complete automation from upload to display
2. **Direct Storage**: Images stored securely in Supabase bucket
3. **Instant Linking**: Database records automatically updated
4. **Reliable Display**: All protest cards show proper images
5. **Scalable System**: Handles unlimited image uploads