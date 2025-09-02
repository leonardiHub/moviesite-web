import { Controller, Get, Param, Res, StreamableFile } from "@nestjs/common";
import { Response } from "express";
import { StorageService } from "./storage.service";

@Controller("videos")
export class VideoController {
  constructor(private readonly storageService: StorageService) {}

  @Get(":key(*)")
  async getVideo(@Param("key") key: string, @Res() res: Response) {
    try {
      console.log("Video request for key:", key);

      // Get the video stream from S3
      const videoStream = await this.storageService.getFileStream(key);

      // Set appropriate headers for video streaming
      res.set({
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000",
      });

      // Pipe the stream to the response
      videoStream.pipe(res);
    } catch (error) {
      console.error("Error serving video:", error);
      res.status(404).json({
        message: "Video not found",
        error: "Not Found",
        statusCode: 404,
      });
    }
  }
}
