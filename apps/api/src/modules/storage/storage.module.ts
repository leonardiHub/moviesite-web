import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { CdnController } from "./cdn.controller";
import { StorageTestController } from "./storage-test.controller";
import { ImageController } from "./image.controller";
import { VideoController } from "./video.controller";

@Global()
@Module({
  controllers: [
    CdnController,
    StorageTestController,
    ImageController,
    VideoController,
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
