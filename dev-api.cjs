const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());                   // 虽然有代理，容错保留
app.use(express.json());           // 解析 JSON body
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/v1/health', (_req, res) => res.json({ ok: true }));

// 播放授权接口（play）
app.get('/v1/movies/:id/play', (req, res) => {
  const { id } = req.params;
  console.log(`🎬 Play request for movie: ${id}`);
  
  // 返回 HLS + MP4 + 字幕 + overlay + 心跳周期
  res.json({
    movieId: id,
    ttl: 900,
    sources: [
      {
        id: 'hls-1080',
        type: 'hls',
        label: 'Auto',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      },
      {
        id: 'mp4-720',
        type: 'mp4',
        label: '720p',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      }
    ],
    subtitles: [
      {
        id: 'en',
        lang: 'en',
        label: 'English',
        // 公网 vtt，已支持跨域：前端 track 上记得传 crossOrigin="anonymous"
        url: 'https://raw.githubusercontent.com/videojs/video.js/main/docs/guides/assets/example-captions.vtt'
      }
    ],
    overlays: [
      {
        id: 'sp1',
        type: 'image',
        placement: 'tr', // 右上角
        start: 10,
        end: 30,
        image: 'https://dummyimage.com/220x90/1e293b/eaeaea&text=SPONSOR',
        href: 'https://example.com'
      }
    ],
    analytics: { heartbeat: 15 }
  });
});

// 埋点接口（track）
app.post('/v1/track', (req, res) => {
  // 打印日志便于核对
  console.log('🛰️ TRACK', JSON.stringify(req.body));
  // 返回 204 更贴近真实埋点
  res.status(204).end();
});

// 兜底：统一 500 错误输出
app.use((err, _req, res, _next) => {
  console.error('Dev API error:', err);
  res.status(500).json({ error: 'dev_api_failed', message: String(err?.message || err) });
});

app.listen(4000, () => {
  console.log('✅ Dev API running at http://localhost:4000');
  console.log('🔍 Health check: http://localhost:4000/v1/health');
  console.log('🎬 Play endpoint: http://localhost:4000/v1/movies/:id/play');
  console.log('🛰️ Track endpoint: http://localhost:4000/v1/track');
});
