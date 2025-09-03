import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { ContentModule } from "../content/content.module";

@Module({
  imports: [ContentModule],
  controllers: [MoviesController],
})
export class MoviesModule {}
