import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClickhouseService implements OnModuleInit {
  private client!: ClickHouseClient;
  private readonly logger = new Logger(ClickhouseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = createClient({
        host: this.configService.get('CLICKHOUSE_URL', 'http://localhost:8123'),
        username: this.configService.get('CLICKHOUSE_USERNAME', 'default'),
        password: this.configService.get('CLICKHOUSE_PASSWORD', ''),
        database: this.configService.get('CLICKHOUSE_DATABASE', 'moviesite_analytics'),
      });

      // Test connection
      await this.ping();
      this.logger.log('ClickHouse connection established');

      // Initialize tables if needed
      await this.initializeTables();
    } catch (error) {
      this.logger.error('Failed to connect to ClickHouse:', error);
    }
  }

  async ping(): Promise<string> {
    const result = await this.client.query({ query: 'SELECT 1' });
    return result.text();
  }

  async initializeTables() {
    // Create events table
    await this.client.command({
      query: `
        CREATE TABLE IF NOT EXISTS events
        (
          ts DateTime('UTC'),
          event LowCardinality(String),
          user_id Nullable(String),
          session_id String,
          anon_id String,
          movie_id Nullable(String),
          episode_id Nullable(String),
          referrer String,
          utm_source LowCardinality(Nullable(String)),
          utm_medium LowCardinality(Nullable(String)),
          utm_campaign LowCardinality(Nullable(String)),
          utm_content Nullable(String),
          utm_term Nullable(String),
          device_type LowCardinality(String),
          os LowCardinality(String),
          os_version Nullable(String),
          browser LowCardinality(String),
          viewport Nullable(String),
          country FixedString(2),
          region Nullable(String),
          city Nullable(String),
          ip_hash Nullable(String),
          network_downlink_mbps Nullable(Float32),
          rtt_ms Nullable(UInt32),
          payload_json String
        )
        ENGINE = MergeTree()
        PARTITION BY toYYYYMM(ts)
        ORDER BY (ts, session_id, event)
        TTL ts + INTERVAL 2 YEAR DELETE;
      `,
    });

    // Create materialized views for common aggregations
    await this.client.command({
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS daily_metrics
        ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (date, event, country, device_type)
        AS SELECT
          toDate(ts) as date,
          event,
          country,
          device_type,
          count() as event_count,
          uniq(session_id) as unique_sessions,
          uniq(user_id) as unique_users
        FROM events
        GROUP BY date, event, country, device_type;
      `,
    });

    this.logger.log('ClickHouse tables initialized');
  }

  // Insert single event
  async insertEvent(event: any): Promise<void> {
    await this.client.insert({
      table: 'events',
      values: [event],
      format: 'JSONEachRow',
    });
  }

  // Batch insert events
  async insertEvents(events: any[]): Promise<void> {
    if (events.length === 0) return;
    
    await this.client.insert({
      table: 'events',
      values: events,
      format: 'JSONEachRow',
    });
  }

  // Execute raw query
  async query(sql: string, params?: Record<string, any>) {
    return this.client.query({
      query: sql,
      query_params: params,
      format: 'JSONEachRow',
    });
  }

  // Execute command (DDL/DML without result)
  async command(sql: string, params?: Record<string, any>) {
    return this.client.command({
      query: sql,
      query_params: params,
    });
  }

  // Common analytics queries
  async getOverviewMetrics(startDate: string, endDate: string) {
    const result = await this.query(`
      SELECT
        count() as total_events,
        uniq(session_id) as unique_sessions,
        uniq(user_id) as unique_users,
        countIf(event = 'page_view') as page_views,
        countIf(event = 'play_click') as play_clicks,
        countIf(event = 'player_start') as player_starts
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
    `, { start_date: startDate, end_date: endDate });

    return result.json();
  }

  async getTopContent(startDate: string, endDate: string, limit: number = 10) {
    const result = await this.query(`
      SELECT
        movie_id,
        count() as events,
        uniq(session_id) as unique_viewers,
        countIf(event = 'detail_view') as detail_views,
        countIf(event = 'play_click') as play_clicks
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
        AND movie_id IS NOT NULL
      GROUP BY movie_id
      ORDER BY play_clicks DESC
      LIMIT {limit:UInt32}
    `, { start_date: startDate, end_date: endDate, limit });

    return result.json();
  }

  async getTimeSeriesData(
    startDate: string,
    endDate: string,
    interval: 'hour' | 'day' = 'day',
    event?: string
  ) {
    const timeFunction = interval === 'hour' ? 'toStartOfHour' : 'toStartOfDay';
    const eventFilter = event ? `AND event = {event:String}` : '';

    const result = await this.query(`
      SELECT
        ${timeFunction}(ts) as time_bucket,
        count() as event_count,
        uniq(session_id) as unique_sessions
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
        ${eventFilter}
      GROUP BY time_bucket
      ORDER BY time_bucket
    `, { start_date: startDate, end_date: endDate, ...(event && { event }) });

    return result.json();
  }

  async getFunnelData(startDate: string, endDate: string) {
    const result = await this.query(`
      SELECT
        event,
        count() as event_count,
        uniq(session_id) as unique_sessions
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
        AND event IN ('page_view', 'detail_view', 'play_click', 'player_start', 'player_quartile')
      GROUP BY event
      ORDER BY 
        CASE event
          WHEN 'page_view' THEN 1
          WHEN 'detail_view' THEN 2
          WHEN 'play_click' THEN 3
          WHEN 'player_start' THEN 4
          WHEN 'player_quartile' THEN 5
        END
    `, { start_date: startDate, end_date: endDate });

    return result.json();
  }

  async getDeviceBreakdown(startDate: string, endDate: string) {
    const result = await this.query(`
      SELECT
        device_type,
        count() as event_count,
        uniq(session_id) as unique_sessions,
        uniq(user_id) as unique_users
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
      GROUP BY device_type
      ORDER BY event_count DESC
    `, { start_date: startDate, end_date: endDate });

    return result.json();
  }

  async getCountryBreakdown(startDate: string, endDate: string, limit: number = 10) {
    const result = await this.query(`
      SELECT
        country,
        count() as event_count,
        uniq(session_id) as unique_sessions,
        uniq(user_id) as unique_users
      FROM events
      WHERE ts >= {start_date:DateTime} AND ts <= {end_date:DateTime}
      GROUP BY country
      ORDER BY event_count DESC
      LIMIT {limit:UInt32}
    `, { start_date: startDate, end_date: endDate, limit });

    return result.json();
  }
}
