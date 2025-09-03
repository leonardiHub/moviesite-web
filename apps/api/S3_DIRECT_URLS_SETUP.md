# S3 Direct URLs Setup Guide

This guide shows how to configure your movie site to serve media directly from S3 URLs, similar to the Twilio example you referenced.

## Environment Variables

Add these to your `.env` file:

```bash
# S3 Configuration
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# S3 URL Configuration
USE_DIRECT_S3_URLS="true"  # Set to "true" to use direct S3 URLs
PUBLIC_BASE_URL="http://localhost:4000"
```

## S3 Bucket Setup

### 1. Make Your Bucket Publicly Readable

```bash
# Create bucket policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}'
```

### 2. Configure CORS (for web access)

```bash
# Create CORS configuration
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'
```

## URL Examples

### Before (API Endpoint):

```
http://localhost:4000/v1/videos/videos/1756828510924-o3f872.mp4
```

### After (Direct S3 URL):

```
https://your-bucket-name.s3.us-east-1.amazonaws.com/videos/1756828510924-o3f872.mp4
```

## Benefits of Direct S3 URLs

1. **Better Performance**: No server processing overhead
2. **CDN Integration**: Can use CloudFront for global distribution
3. **Cost Effective**: Reduced server bandwidth usage
4. **Scalability**: S3 handles the load directly

## Security Considerations

1. **Public Access**: Files are publicly accessible
2. **Access Control**: Consider using signed URLs for private content
3. **Hotlinking Protection**: Use CloudFront with referrer restrictions

## Alternative: Signed URLs (More Secure)

For private content, you can generate signed URLs:

```typescript
// In your storage service
async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: this.bucketName,
    Key: key,
  });

  return await getSignedUrl(this.s3Client, command, { expiresIn });
}
```

## Testing

1. Set `USE_DIRECT_S3_URLS="true"` in your `.env`
2. Restart your API server
3. Check the movie API response - `s3Url` should now be a direct S3 URL
4. Test the URL in your browser - it should load the video directly
