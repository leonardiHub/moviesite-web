import { Module } from "@nestjs/common";
import { CastController } from "./cast.controller";
import { CastService } from "./cast.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, AuthModule, StorageModule],
  controllers: [CastController],
  providers: [CastService],
  exports: [CastService],
})
export class CastModule {}
