import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { CdnController } from "./cdn.controller";
import { StorageTestController } from "./storage-test.controller";
import { ImageController } from "./image.controller";

@Global()
@Module({
  controllers: [CdnController, StorageTestController, ImageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
