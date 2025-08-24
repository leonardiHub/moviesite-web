import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './modules/prisma/prisma.module';
import { ClickhouseModule } from './modules/clickhouse/clickhouse.module';
import { RedisModule } from './modules/redis/redis.module';
import { MeilisearchModule } from './modules/meilisearch/meilisearch.module';
import { StorageModule } from './modules/storage/storage.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BrandModule } from './modules/brand/brand.module';
import { SponsorModule } from './modules/sponsor/sponsor.module';
import { UserModule } from './modules/user/user.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';

// New API contract modules
import { HomeModule } from './modules/home/home.module';
import { MoviesModule } from './modules/movies/movies.module';
import { TrackModule } from './modules/track/track.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Core modules
    PrismaModule,
    ClickhouseModule,
    RedisModule,
    MeilisearchModule,
    StorageModule,

    // Feature modules (暂时注释部分模块用于M2-5验证)
    // AuthModule,
    // ContentModule,
    // AnalyticsModule,
    BrandModule,
    // SponsorModule,
    // UserModule,
    // SearchModule,
    // AdminModule,

    // New API contract modules (M1) - M2-5验证核心
    HomeModule,
    MoviesModule,
    TrackModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
