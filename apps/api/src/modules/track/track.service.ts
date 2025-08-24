import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TrackService {
  private readonly logger = new Logger('Track');

  async ingest(evt: any, ctx: { ip: string; ua?: string }) {
    // 生产化时可替换为 ClickHouse/队列
    this.logger.log(JSON.stringify({ ...evt, ip: ctx.ip, ua: ctx.ua }));
    return;
  }
}
