// 简单测试服务器 - CommonJS版本
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  if (req.url === '/v1/movies/m1/play') {
    const data = {
      movieId: 'm1',
      ttl: 900,
      analytics: { heartbeat: 15 },
      sources: [
        {
          id: 'hls-auto',
          type: 'hls', 
          label: 'Auto',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        },
        {
          id: 'mp4-720',
          type: 'mp4',
          label: '720p', 
          url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4'
        }
      ],
      subtitles: [{
        lang: 'en',
        label: 'English',
        url: 'https://cdn.jsdelivr.net/gh/videojs/video.js@7.20.3/docs/examples/shared-resources/captions/english.vtt'
      }],
      overlays: [{
        type: 'image',
        placement: 'tr',
        start: 10,
        end: 30,
        url: 'https://dummyimage.com/160x90/E50914/ffffff&text=Sponsor',
        clickUrl: 'https://example.com',
        width: 160,
        height: 90
      }]
    };
    res.end(JSON.stringify(data));
  } else if (req.url === '/v1/track' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('🛰️  TRACK:', body);
      res.writeHead(204);
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ 简单测试服务器启动: http://localhost:${PORT}`);
  console.log(`🎬 播放授权API: http://localhost:${PORT}/v1/movies/m1/play`);
  console.log(`📊 埋点API: http://localhost:${PORT}/v1/track`);
});

server.on('error', (err) => {
  console.error('❌ 服务器启动失败:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log('端口4000被占用，尝试关闭占用进程或使用其他端口');
  }
});
