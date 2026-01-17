# S3 Image Upload Implementation - Completed

This document describes the implementation of S3 image upload functionality for the SalvaCell system.

## Overview

The system now supports both local and S3 storage for order photos, configurable via the `STORAGE_TYPE` environment variable.

## Implementation Details

### 1. Dependencies Added

- **boto3==1.34.51** - AWS SDK for Python, added to `backend/requirements.txt`

### 2. S3 Service Module

Created `backend/services/s3_service.py` with the following features:

#### S3Service Class
- **Lazy initialization**: S3 client is created only when needed
- **Configuration check**: Validates S3 credentials before use
- **Error handling**: Comprehensive exception handling for AWS operations

#### Key Methods
1. `upload_file(file_obj, key, content_type)` - Upload file to S3
2. `delete_file(key)` - Delete file from S3
3. `generate_presigned_url(key, expires_in)` - Generate presigned URL for direct upload
4. `generate_presigned_download_url(key, expires_in)` - Generate presigned URL for download
5. `is_configured()` - Check if S3 is properly configured

### 3. Updated Photos Router

Modified `backend/routers/photos.py` to support both storage types:

#### Enhanced `save_upload_file()` Function
- Checks `STORAGE_TYPE` setting
- Routes to S3 or local storage accordingly
- For S3: stores S3 key in `file_path` field
- For local: stores filesystem path in `file_path` field
- Maintains backward compatibility with existing local storage

#### New Endpoint: Generate Presigned URL
```
GET /photos/orders/{order_id}/presigned-url?file_name=image.jpg
```

**Features:**
- Only available when `STORAGE_TYPE=s3`
- Validates order exists
- Validates file type (images only)
- Generates unique filename
- Returns presigned URL with 1-hour expiration
- Enables direct client-to-S3 uploads without exposing credentials

**Response:**
```json
{
  "presigned_url": "https://...",
  "s3_key": "order-photos/{order_id}/{unique_filename}",
  "expires_in": 3600,
  "file_name": "{unique_filename}"
}
```

#### Enhanced Upload Endpoint
```
POST /photos/orders/{order_id}/photos
```

**Features:**
- Automatically detects storage type
- Uploads to S3 when `STORAGE_TYPE=s3`
- Falls back to local storage when `STORAGE_TYPE=local`
- Maintains same API interface for client compatibility

#### Enhanced Delete Endpoint
```
DELETE /photos/{photo_id}
```

**Features:**
- Detects storage type from database
- Deletes from S3 or local filesystem accordingly
- Graceful error handling

## Configuration

### Environment Variables

```env
# File Storage Type
STORAGE_TYPE=s3  # Options: local, s3

# S3 Configuration (required when STORAGE_TYPE=s3)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

### Configuration in `config.py`

Already configured with the following settings:
- `STORAGE_TYPE`: Storage backend selection
- `S3_BUCKET`: S3 bucket name
- `S3_REGION`: AWS region
- `S3_ACCESS_KEY`: AWS access key ID
- `S3_SECRET_KEY`: AWS secret access key

## Usage Examples

### 1. Direct Upload (Server Upload)

```bash
# Upload photo through backend API
curl -X POST \
  http://localhost:8000/photos/orders/{order_id}/photos \
  -H "Content-Type: multipart/form-data" \
  -F "file=@photo.jpg" \
  -F "description=Device front photo"
```

This works with both local and S3 storage automatically.

### 2. Presigned URL Upload (Client-to-S3)

```bash
# Step 1: Get presigned URL from backend
curl -X GET \
  "http://localhost:8000/photos/orders/{order_id}/presigned-url?file_name=photo.jpg"

# Response:
# {
#   "presigned_url": "https://bucket.s3.region.amazonaws.com/...",
#   "s3_key": "order-photos/{order_id}/abc123.jpg",
#   "expires_in": 3600,
#   "file_name": "abc123.jpg"
# }

# Step 2: Upload directly to S3 using presigned URL
curl -X PUT \
  "https://bucket.s3.region.amazonaws.com/..." \
  -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg

# Step 3: Save photo metadata to database
curl -X POST \
  http://localhost:8000/photos/orders/{order_id}/photos \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "order-photos/{order_id}/abc123.jpg",
    "file_url": "https://bucket.s3.region.amazonaws.com/...",
    "description": "Device front photo"
  }'
```

### 3. List Order Photos

```bash
curl -X GET \
  http://localhost:8000/photos/orders/{order_id}/photos
```

### 4. Delete Photo

```bash
curl -X DELETE \
  http://localhost:8000/photos/{photo_id}
```

## Security Considerations

1. **AWS Credentials**: Never commit credentials to version control
2. **Presigned URLs**: Expire after 1 hour to limit exposure
3. **File Validation**: Only allowed image types (.jpg, .jpeg, .png, .gif, .webp, .heic)
4. **S3 Bucket Permissions**: Configure bucket policy for least privilege access
5. **CORS**: Configure S3 bucket CORS for direct client uploads

### Recommended S3 Bucket CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Recommended S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackendAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/salvacell-backend"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/order-photos/*"
    },
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/order-photos/*"
    }
  ]
}
```

## File Organization in S3

Photos are organized with the following structure:
```
s3://bucket-name/
  └── order-photos/
      └── {order_id}/
          ├── {order_id}_{uuid1}.jpg
          ├── {order_id}_{uuid2}.png
          └── ...
```

This organization:
- Groups photos by order for easy management
- Uses unique filenames to prevent collisions
- Allows easy deletion of all order photos if needed

## Database Schema

The `order_photos` table stores photo metadata:

| Column | Type | Description |
|--------|------|-------------|
| id | String(50) | UUID primary key |
| order_id | String(50) | Foreign key to orders |
| file_path | String(500) | S3 key or local path |
| file_url | String(500) | Public URL to access photo |
| description | Text | Optional description |
| file_size | Integer | File size in bytes |
| mime_type | String(100) | Content type |
| uploaded_by | String(50) | User who uploaded (optional) |
| created_at | DateTime | Upload timestamp |

## Migration from Local to S3

To migrate existing local photos to S3:

1. Update environment variables to use S3
2. Run a migration script (to be created if needed) to:
   - Upload existing files to S3
   - Update `file_path` and `file_url` in database
3. Verify all photos are accessible
4. Remove local files after verification

## Testing

### Manual Testing Checklist

- [x] S3 service module syntax check
- [x] Photos router syntax check
- [x] boto3 dependency verification
- [ ] Local storage upload (existing functionality)
- [ ] S3 storage upload (new functionality)
- [ ] Presigned URL generation
- [ ] File deletion from S3
- [ ] File deletion from local storage
- [ ] Invalid file type rejection
- [ ] Order not found error handling

### Automated Testing

Consider adding pytest tests for:
- S3Service class methods
- Photo upload with mocked S3 client
- Presigned URL generation
- Storage type switching

## Benefits

1. **Scalability**: S3 provides unlimited storage
2. **Reliability**: 99.999999999% durability
3. **Performance**: CDN integration possible
4. **Cost-effective**: Pay only for what you use
5. **Direct uploads**: Reduce backend load with presigned URLs
6. **Backward compatible**: Existing local storage still works

## Future Enhancements

- [ ] Add support for other S3-compatible services (MinIO, DigitalOcean Spaces)
- [ ] Implement image resizing/optimization before storage
- [ ] Add support for image thumbnails
- [ ] Implement CDN integration for faster delivery
- [ ] Add batch upload capability
- [ ] Implement lifecycle policies for old photos
- [ ] Add support for private photos with temporary access

## Troubleshooting

### Common Issues

1. **"S3 is not properly configured"**
   - Check that S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY are set
   - Verify credentials have proper permissions

2. **"NoCredentialsError"**
   - AWS credentials are missing or incorrect
   - Check .env file has correct values

3. **"Access Denied"**
   - IAM user lacks necessary S3 permissions
   - Check bucket policy allows the IAM user

4. **"Presigned URLs not available"**
   - Ensure STORAGE_TYPE=s3 in .env
   - Verify S3 is properly configured

5. **CORS errors on direct upload**
   - Configure S3 bucket CORS policy
   - Allow PUT method from your domain

## References

- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [FastAPI File Uploads](https://fastapi.tiangolo.com/tutorial/request-files/)
