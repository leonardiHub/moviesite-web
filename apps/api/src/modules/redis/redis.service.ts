import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private subscriber!: Redis;
  private publisher!: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL', 'redis://localhost:6379');
    
    try {
      // Main client for general operations
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      // Separate clients for pub/sub
      this.subscriber = new Redis(redisUrl);
      this.publisher = new Redis(redisUrl);

      // Setup event listeners
      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis client error:', error);
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      // Test connection
      await this.client.ping();
      this.logger.log('Redis connection established');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client?.quit(),
      this.subscriber?.quit(),
      this.publisher?.quit(),
    ]);
  }

  // Basic Redis operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async setex(key: string, ttl: number, value: string): Promise<'OK'> {
    return this.client.setex(key, ttl, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, ttl: number): Promise<number> {
    return this.client.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
    const json = JSON.stringify(value);
    return ttl ? this.client.setex(key, ttl, json) : this.client.set(key, json);
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.client.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]> {
    const args: any[] = [cursor];
    if (pattern) {
      args.push('MATCH', pattern);
    }
    if (count) {
      args.push('COUNT', count);
    }
    return this.client.scan(args[0] || '0', args[1] || 'MATCH', args[2] || '*', args[3] || 'COUNT', args[4] || 10);
  }

  // Rate limiting helpers
  async isRateLimited(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, window);
    }
    return current > limit;
  }

  // Session management
  async getSession(sessionId: string): Promise<any> {
    return this.getJson(`session:${sessionId}`);
  }

  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<'OK'> {
    return this.setJson(`session:${sessionId}`, data, ttl);
  }

  async deleteSession(sessionId: string): Promise<number> {
    return this.del(`session:${sessionId}`);
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    return keys.length > 0 ? this.client.del(...keys) : 0;
  }

  // Distributed locking
  async acquireLock(key: string, ttl: number = 30, value?: string): Promise<boolean> {
    const lockValue = value || Date.now().toString();
    const result = await this.client.set(`lock:${key}`, lockValue, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string, value?: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const lockValue = value || await this.get(`lock:${key}`);
    const result = await this.client.eval(script, 1, `lock:${key}`, lockValue || '');
    return result === 1;
  }

  // Health check
  async ping(): Promise<string> {
    return this.client.ping();
  }

  // Get Redis client for advanced operations
  getClient(): Redis {
    return this.client;
  }
}
