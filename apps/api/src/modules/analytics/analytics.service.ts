import { Injectable } from '@nestjs/common';
import { ClickhouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly ch: ClickhouseService) {}

  async overview(range: { start: string; end: string }) {
    const [metrics, devices, countries, top] = await Promise.all([
      this.ch.getOverviewMetrics(range.start, range.end),
      this.ch.getDeviceBreakdown(range.start, range.end),
      this.ch.getCountryBreakdown(range.start, range.end, 10),
      this.ch.getTopContent(range.start, range.end, 10),
    ]);

    return { metrics, devices, countries, top };
  }

  async content(movieId: string, range: { start: string; end: string }) {
    const timeseries = await this.ch.getTimeSeriesData(range.start, range.end, 'day', 'player_start');
    return { movieId, timeseries };
  }

  async funnel(range: { start: string; end: string }) {
    return this.ch.getFunnelData(range.start, range.end);
  }
}


