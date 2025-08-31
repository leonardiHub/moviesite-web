import { Module } from "@nestjs/common";
import { ContentController } from "./content.controller";
import { MovieService } from "./movie.service";
import { SeriesService } from "./series.service";
import { PersonService } from "./person.service";
import { GenreService } from "./genre.service";
import { TagService } from "./tag.service";
import { CollectionService } from "./collection.service";
import { HomepageService } from "./homepage.service";
import { MediaService } from "./media.service";

import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ContentController],
  providers: [
    MovieService,
    SeriesService,
    PersonService,
    GenreService,
    TagService,
    CollectionService,
    HomepageService,
    MediaService,
  ],
  exports: [
    MovieService,
    SeriesService,
    PersonService,
    GenreService,
    TagService,
    CollectionService,
    HomepageService,
    MediaService,
  ],
})
export class ContentModule {}
