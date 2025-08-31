import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { StorageService } from "./storage.service";

@Controller("images")
export class ImageController {
  constructor(private storageService: StorageService) {}

  @Get("poster/:key")
  async servePoster(@Param("key") key: string, @Res() res: Response) {
    try {
      // Decode the key parameter
      const decodedKey = decodeURIComponent(key);

      // Get the file from S3
      const { stream, contentType } =
        await this.storageService.getFileStreamWithMetadata(decodedKey);

      // Set appropriate headers for cross-origin requests
      res.set({
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow all origins for images
        "Access-Control-Allow-Methods": "*", // Allow all methods
        "Access-Control-Allow-Headers": "*", // Allow all headers
        "Access-Control-Allow-Credentials": "false", // Must be false when Allow-Origin is *
        "Access-Control-Expose-Headers": "*", // Expose all headers
      });

      // Pipe the file stream to response
      stream.pipe(res);
    } catch (error) {
      console.error(`Image: Error serving poster ${key}:`, error);
      throw new NotFoundException("Image not found");
    }
  }

  @Get("artwork/:kind/:key")
  async serveArtwork(
    @Param("kind") kind: string,
    @Param("key") key: string,
    @Res() res: Response
  ) {
    try {
      // Decode the key parameter
      const decodedKey = decodeURIComponent(key);

      // Get the file from S3
      const { stream, contentType } =
        await this.storageService.getFileStreamWithMetadata(decodedKey);

      // Set appropriate headers for cross-origin requests
      res.set({
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow all origins for images
        "Access-Control-Allow-Methods": "*", // Allow all methods
        "Access-Control-Allow-Headers": "*", // Allow all headers
        "Access-Control-Allow-Credentials": "false", // Must be false when Allow-Origin is *
        "Access-Control-Expose-Headers": "*", // Expose all headers
      });

      // Pipe the file stream to response
      stream.pipe(res);
    } catch (error) {
      console.error(`Image: Error serving artwork ${kind}/${key}:`, error);
      throw new NotFoundException("Image not found");
    }
  }

  @Get(":key")
  async serveImage(@Param("key") key: string, @Res() res: Response) {
    try {
      // Decode the key parameter
      const decodedKey = decodeURIComponent(key);

      // Get the file from S3
      const { stream, contentType } =
        await this.storageService.getFileStreamWithMetadata(decodedKey);

      // Set appropriate headers for cross-origin requests
      res.set({
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow all origins for images
        "Access-Control-Allow-Methods": "*", // Allow all methods
        "Access-Control-Allow-Headers": "*", // Allow all headers
        "Access-Control-Allow-Credentials": "false", // Must be false when Allow-Origin is *
        "Access-Control-Expose-Headers": "*", // Expose all headers
      });

      // Pipe the file stream to response
      stream.pipe(res);
    } catch (error) {
      console.error(`Image: Error serving image ${key}:`, error);
      throw new NotFoundException("Image not found");
    }
  }
}
