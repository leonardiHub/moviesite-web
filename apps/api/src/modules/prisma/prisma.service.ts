import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      // Allow the API to boot even if the database is temporarily unavailable.
      // Services that depend on Prisma will return proper errors when used.
      console.warn('[Prisma] Failed to connect on startup. Continuing without DB.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => String(key)[0] !== '_' && String(key)[0] !== '$' && key !== 'cleanDatabase'
    );

    for (const model of models) {
      await (this as any)[model].deleteMany();
    }
  }
}
