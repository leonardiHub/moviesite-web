import { Controller, Get, Param } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { ConfigService } from "@nestjs/config";

@Controller("storage-test")
export class StorageTestController {
  constructor(
    private storageService: StorageService,
    private configService: ConfigService
  ) {}

  @Get("config")
  testConfig() {
    return {
      bucket: this.configService.get("AWS_S3_BUCKET"),
      region: this.configService.get("AWS_REGION"),
      hasAccessKey: !!this.configService.get("AWS_ACCESS_KEY_ID"),
      hasSecretKey: !!this.configService.get("AWS_SECRET_ACCESS_KEY"),
    };
  }

  @Get("presigned/:key")
  async testPresigned(@Param("key") key: string) {
    try {
      // Decode the key parameter
      const decodedKey = decodeURIComponent(key);
      const presignedUrl =
        await this.storageService.generatePresignedDownloadUrl(
          decodedKey,
          3600
        );
      return {
        success: true,
        key: decodedKey,
        presignedUrl,
      };
    } catch (error) {
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  @Get("test-s3")
  async testS3() {
    try {
      // Test basic S3 operations
      const bucket = this.configService.get("AWS_S3_BUCKET");
      const region = this.configService.get("AWS_REGION");

      // Try to list objects in the bucket (this will test S3 connectivity)
      // For now, just return the configuration
      return {
        success: true,
        bucket,
        region,
        message: "S3 configuration loaded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }
}
