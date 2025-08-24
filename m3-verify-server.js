/* eslint-disable */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

// —— 中间件
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: '*/*', limit: '1mb' })); // 兼容 sendBeacon 的 text/plain
app.use(morgan('dev'));

// —— 简易健康检查
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

// —— 临时 home（可选，给 /api-home 用）
app.get('/v1/home', (_, res) => {
  res.json({
    brand: { name: 'EZ Movie', palette: { primary: '#E50914' } },
    sponsors: [{ id: 's1', name: 'Demo Sponsor', logo: 'https://dummyimage.com/120x40/E50914/ffffff&text=SP' }],
    sections: [{ id: 'hero', kind: 'hero', items: [{ id: 'm1', title: 'Demo Movie' }]}],
  });
});

// —— 关键：播放授权（M3 验收用）
app.get('/v1/movies/:id/play', (req, res) => {
  const { id } = req.params;
  // 选择 HLS 测试源（Mux 官方 Demo，CORS 正常）
  const HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  const MP4 = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4';
  const SUB = 'https://cdn.jsdelivr.net/gh/videojs/video.js@7.20.3/docs/examples/shared-resources/captions/english.vtt';

  res.json({
    movieId: id,
    ttl: 900,
    analytics: { heartbeat: 15 }, // 15s 心跳，便于观察
    sources: [
      { id: 'hls-auto', type: 'hls', label: 'Auto', url: HLS },
      { id: 'mp4-720', type: 'mp4', label: '720p', url: MP4 },
    ],
    subtitles: [
      { lang: 'en', label: 'English', url: SUB },
    ],
    overlays: [
      {
        type: 'image',
        placement: 'tr',
        start: 10,
        end: 30,
        url: 'https://dummyimage.com/160x90/E50914/ffffff&text=Sponsor',
        clickUrl: 'https://example.com',
        width: 160, height: 90
      }
    ],
  });
});

// —— 列表 & 详情（占位）
app.get('/v1/movies', (req, res) => {
  res.json({ items: [{ id: 'm1', title: 'Demo Movie' }], page: 1, pageSize: 24, total: 1 });
});
app.get('/v1/movies/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, title: `Movie ${id}`, year: 2024, genres: ['Action'] });
});

// —— 埋点：接收所有事件并打印（兼容 sendBeacon）
app.post('/v1/track', (req, res) => {
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { /* ignore */ }
  }
  console.log('🛰️  TRACK:', JSON.stringify(payload));
  res.status(204).end();
});

// —— 启动
app.listen(PORT, () => {
  console.log(`✅ Verify API running at http://localhost:${PORT}`);
});