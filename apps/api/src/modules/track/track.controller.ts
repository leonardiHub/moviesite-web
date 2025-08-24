import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrackService } from './track.service';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('Analytics')
@Controller('track')
export class TrackController {
  constructor(private readonly svc: TrackService) {}

  @Post()
  @HttpCode(204)
  @ApiOperation({ summary: 'Track user events' })
  async track(@Body() dto: TrackEventDto, @Req() req: any, @Headers('user-agent') ua?: string) {
    const ip =
      // 代理头（如有 CDN/反代）
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    await this.svc.ingest(
      {
        ...dto,
        serverTs: new Date().toISOString(),
      },
      { ip, ua },
    );
  }
}
