import { Controller, Get, Param, Res, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { StorageService } from "./storage.service";
import { ConfigService } from "@nestjs/config";

@Controller("cdn")
export class CdnController {
  constructor(
    private storageService: StorageService,
    private configService: ConfigService
  ) {}

  @Get("*")
  async serveFile(@Param("*") path: string, @Res() res: Response) {
    try {
      console.log(`CDN: Attempting to serve file: ${path}`);

      // Generate presigned URL for the S3 file
      const presignedUrl =
        await this.storageService.generatePresignedDownloadUrl(path, 3600); // 1 hour expiry

      console.log(`CDN: Generated presigned URL: ${presignedUrl}`);

      // Redirect to the presigned URL
      res.redirect(presignedUrl);
    } catch (error) {
      console.error(`CDN: Error serving file ${path}:`, error);

      // Return a more detailed error for debugging
      if (error instanceof Error) {
        throw new NotFoundException(`File not found: ${error.message}`);
      } else {
        throw new NotFoundException("File not found");
      }
    }
  }
}
