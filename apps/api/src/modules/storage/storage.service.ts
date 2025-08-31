import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get("AWS_S3_BUCKET", "moviesite-media");

    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION", "us-east-1"),
      endpoint: this.configService.get("AWS_S3_ENDPOINT"),
      s3ForcePathStyle: !!this.configService.get("AWS_S3_ENDPOINT"),
    });
  }

  // Generate presigned URL for uploads
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; fields: Record<string, string> }> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
      ContentType: contentType,
      Conditions: [
        ["content-length-range", 0, 100 * 1024 * 1024], // Max 100MB
        ["starts-with", "$Content-Type", contentType.split("/")[0] + "/"],
      ],
    };

    return new Promise((resolve, reject) => {
      this.s3.createPresignedPost(params, (err, data) => {
        if (err) {
          this.logger.error("Error generating presigned URL:", err);
          reject(err);
        } else {
          resolve({
            url: data.url,
            fields: data.fields,
          });
        }
      });
    });
  }

  // Generate presigned URL for downloads
  async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrlPromise("getObject", params);
  }

  // Get file stream for direct serving
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    const response = await this.s3.getObject(params).promise();

    if (!response.Body) {
      throw new Error("File body is empty");
    }

    // Convert Buffer to ReadableStream
    const { Readable } = require("stream");
    const stream = new Readable();
    stream.push(response.Body);
    stream.push(null);

    return stream;
  }

  // Get file stream with metadata for direct serving
  async getFileStreamWithMetadata(
    key: string
  ): Promise<{ stream: NodeJS.ReadableStream; contentType: string }> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    const response = await this.s3.getObject(params).promise();

    if (!response.Body) {
      throw new Error("File body is empty");
    }

    // Convert Buffer to ReadableStream
    const { Readable } = require("stream");
    const stream = new Readable();
    stream.push(response.Body);
    stream.push(null);

    return {
      stream,
      contentType: response.ContentType || "image/jpeg",
    };
  }

  // Upload file directly (for server-side uploads)
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata || {},
    };

    return this.s3.upload(params).promise();
  }

  // Upload file from stream
  async uploadStream(
    key: string,
    stream: NodeJS.ReadableStream,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: stream,
      ContentType: contentType,
      Metadata: metadata || {},
    };

    return this.s3.upload(params).promise();
  }

  // Delete file
  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  // Delete multiple files
  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    };

    await this.s3.deleteObjects(params).promise();
  }

  // Copy file
  async copyFile(sourceKey: string, destKey: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destKey,
    };

    await this.s3.copyObject(params).promise();
  }

  // Get file metadata
  async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    return this.s3.headObject(params).promise();
  }

  // Check if file exists
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileMetadata(key);
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        "statusCode" in error &&
        (error as any).statusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  // List files with prefix
  async listFiles(
    prefix: string,
    maxKeys: number = 1000
  ): Promise<AWS.S3.ListObjectsV2Output> {
    const params = {
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    return this.s3.listObjectsV2(params).promise();
  }

  // Generate optimized file paths
  generatePath(
    type: "poster" | "backdrop" | "avatar" | "logo" | "sponsor" | "subtitle",
    filename: string
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = filename.split(".").pop();

    return `${type}s/${timestamp}-${random}.${extension}`;
  }

  // Generate thumbnail path
  generateThumbnailPath(originalPath: string, size: string): string {
    const parts = originalPath.split("/");
    const filename = parts.pop();
    const nameWithoutExt =
      filename?.split(".").slice(0, -1).join(".") || "file";
    const ext = filename?.split(".").pop() || "";

    return `${parts.join("/")}/thumbs/${nameWithoutExt}_${size}.${ext}`;
  }

  // Get public URL for a file
  getPublicUrl(key: string): string {
    const endpoint = this.configService.get("AWS_S3_ENDPOINT");
    const region = this.configService.get("AWS_REGION", "us-east-1");

    if (endpoint) {
      // Custom endpoint (like DigitalOcean Spaces)
      return `${endpoint}/${this.bucket}/${key}`;
    } else {
      // AWS S3
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    }
  }

  // Batch operations
  async uploadMultipleFiles(
    files: Array<{
      key: string;
      buffer: Buffer;
      contentType: string;
      metadata?: Record<string, string>;
    }>
  ): Promise<AWS.S3.ManagedUpload.SendData[]> {
    const uploads = files.map((file) =>
      this.uploadFile(file.key, file.buffer, file.contentType, file.metadata)
    );

    return Promise.all(uploads);
  }

  // Generate multiple thumbnails
  async generateThumbnails(
    originalKey: string,
    sizes: Array<{ name: string; width: number; height: number }>
  ): Promise<string[]> {
    // This would integrate with an image processing service
    // For now, return the paths where thumbnails would be stored
    return sizes.map((size) =>
      this.generateThumbnailPath(originalKey, `${size.width}x${size.height}`)
    );
  }

  // Storage analytics
  async getStorageStats(): Promise<{
    totalObjects: number;
    totalSize: number;
    objectsByType: Record<string, number>;
  }> {
    // This would scan the bucket and return statistics
    // For production, consider using CloudWatch metrics instead
    const mockStats = {
      totalObjects: 0,
      totalSize: 0,
      objectsByType: {
        posters: 0,
        backdrops: 0,
        avatars: 0,
        logos: 0,
        sponsors: 0,
        subtitles: 0,
      },
    };

    return mockStats;
  }

  // Cleanup old/unused files
  async cleanupOldFiles(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;
    let continuationToken: string | undefined;

    do {
      const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: this.bucket,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      };

      const response = await this.s3.listObjectsV2(listParams).promise();

      if (response.Contents) {
        const oldFiles = response.Contents.filter(
          (obj) => obj.LastModified && obj.LastModified < cutoffDate
        );

        if (oldFiles.length > 0) {
          const keysToDelete = oldFiles.map((obj) => obj.Key!);
          await this.deleteFiles(keysToDelete);
          deletedCount += keysToDelete.length;
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    this.logger.log(`Cleaned up ${deletedCount} old files`);
    return deletedCount;
  }
}
