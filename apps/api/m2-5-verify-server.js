const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 4000;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', /localhost:\d+$/],
  credentials: true
}));
app.use(express.json());

// 简单的日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`, 
    req.method === 'POST' ? req.body : '');
  next();
});

// M2-5 验证接口

// 1. Home 接口
app.get('/v1/home', (req, res) => {
  res.json({
    brand: { 
      name: 'EZ Movie', 
      logo: { light: '/cdn/brand/logo-light.svg', dark: '/cdn/brand/logo-dark.svg' },
      palette: { primary: '#E50914', bg: '#0a0c12', text: '#e6e9f2' }
    },
    sponsors: [
      { id: 's1', placement: 'home_hero', image: '/cdn/sponsor/hero-1.png', url: 'https://example.com', title: 'Sponsor 1' }
    ],
    sections: [
      { 
        id: 'hero', 
        kind: 'hero', 
        items: [{ 
          id: 'm1', 
          title: 'John Wick 4', 
          backdrop: '/cdn/m/m1/backdrop.jpg', 
          year: 2023,
          synopsis: 'Action-packed thriller sequel'
        }] 
      },
      { 
        id: 'popular', 
        kind: 'slider', 
        title: 'หนังยอดนิยม', 
        items: [
          { id: 'm2', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', rating: 8.0, year: 2021 },
          { id: 'm3', title: 'Spider-Man', poster: '/cdn/m/m3/poster.jpg', rating: 8.2, year: 2021 }
        ]
      }
    ]
  });
});

// 2. Movies 列表接口
app.get('/v1/movies', (req, res) => {
  const { page = 1, limit = 24 } = req.query;
  const mockMovies = [
    { id: 'm1', title: 'John Wick 4', poster: '/cdn/m/m1/poster.jpg', year: 2023, rating: 8.5 },
    { id: 'm2', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', year: 2021, rating: 8.0 },
    { id: 'm3', title: 'Spider-Man', poster: '/cdn/m/m3/poster.jpg', year: 2021, rating: 8.2 }
  ];
  
  res.json({
    items: mockMovies.slice(0, limit),
    page: parseInt(page),
    limit: parseInt(limit),
    total: mockMovies.length,
    hasMore: false
  });
});

// 3. Movie 详情接口
app.get('/v1/movies/:id', (req, res) => {
  const { id } = req.params;
  const movieDetail = {
    id,
    title: `Movie ${id}`,
    originalTitle: `Original Movie ${id}`,
    year: 2023,
    runtime: 120,
    rating: 8.0,
    synopsis: `详细描述 for movie ${id}`,
    poster: `/cdn/m/${id}/poster.jpg`,
    backdrop: `/cdn/m/${id}/backdrop.jpg`,
    genres: ['Action', 'Thriller'],
    tags: ['พากย์ไทย', 'ซับไทย'],
    cast: [{ id: 'p1', name: 'Actor Name', character: 'Character Name' }],
    crew: [{ id: 'p2', name: 'Director Name', role: 'Director' }],
    related: []
  };
  
  res.json(movieDetail);
});

// 4. Play 授权接口 (M2-5核心)
app.get('/v1/movies/:id/play', (req, res) => {
  const { id } = req.params;
  const ttl = 900; // 15 minutes
  const now = Date.now();
  
  const playData = {
    movieId: id,
    ttl,
    expiresAt: new Date(now + ttl * 1000).toISOString(),
    sources: [
      {
        id: 'hls-1080',
        type: 'hls',
        label: '1080p',
        url: `http://localhost:4000/cdn/placeholder/demo.m3u8`
      },
      {
        id: 'hls-720',
        type: 'hls',
        label: '720p',
        url: `http://localhost:4000/cdn/placeholder/demo-720.m3u8`
      }
    ],
    subtitles: [
      { lang: 'th', label: 'ไทย', url: `http://localhost:4000/cdn/placeholder/th.vtt` },
      { lang: 'en', label: 'English', url: `http://localhost:4000/cdn/placeholder/en.vtt` }
    ],
    overlays: [
      {
        type: 'image',
        placement: 'tr',
        start: 10,
        end: 30,
        url: `http://localhost:4000/cdn/sponsors/overlay.png`,
        href: 'https://example.com',
        opacity: 0.9
      }
    ],
    analytics: { heartbeat: 30 }
  };
  
  console.log(`🎬 Play授权生成: ${id}, TTL: ${ttl}s, 过期时间: ${playData.expiresAt}`);
  res.json(playData);
});

// 5. Track 埋点接口 (M2-5核心)
app.post('/v1/track', (req, res) => {
  const { type, movieId, path, meta, sessionId, timestamp } = req.body;
  
  console.log(`📊 埋点事件: ${type}`, {
    movieId,
    path, 
    meta,
    sessionId: sessionId?.slice(0, 8) + '...',
    timestamp
  });
  
  // 模拟处理时间
  setTimeout(() => {
    res.status(204).send(); // 204 No Content
  }, 10);
});

// 6. Brand 接口
app.get('/v1/brand', (req, res) => {
  res.json({
    name: 'EZ Movie',
    logo: { 
      light: '/cdn/brand/logo-light.svg', 
      dark: '/cdn/brand/logo-dark.svg'
    },
    palette: { 
      primary: '#E50914', 
      accent: '#00c4ad',
      bg: '#0a0c12', 
      text: '#e6e9f2' 
    },
    fontFamily: 'Kanit, sans-serif',
    favicon: '/cdn/brand/favicon.ico'
  });
});

// 7. Sponsors 接口
app.get('/v1/sponsors/placements', (req, res) => {
  const { page = 'home' } = req.query;
  const placements = {
    home: [
      { 
        id: 's1', 
        placement: 'home_hero', 
        page: 'home',
        type: 'banner',
        image: '/cdn/sponsors/hero-1.png', 
        url: 'https://example.com',
        title: 'Hero Sponsor'
      }
    ],
    detail: [
      { 
        id: 's2', 
        placement: 'detail_sidebar', 
        page: 'detail',
        type: 'banner',
        image: '/cdn/sponsors/sidebar-1.png', 
        url: 'https://example.com',
        title: 'Detail Sponsor'
      }
    ]
  };
  
  res.json(placements[page] || []);
});

// 静态文件 (占位)
app.use('/cdn', express.static('public/cdn', {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// 错误处理
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`\n🚀 M2-5验证服务器已启动`);
  console.log(`📡 API Base: http://localhost:${PORT}/v1`);
  console.log(`📚 测试链接:`);
  console.log(`   - Home: http://localhost:${PORT}/v1/home`);
  console.log(`   - Movies: http://localhost:${PORT}/v1/movies`);
  console.log(`   - Play Auth: http://localhost:${PORT}/v1/movies/m1/play`);
  console.log(`   - Track: POST http://localhost:${PORT}/v1/track`);
  console.log(`\n⭐ 准备就绪，可以开始M2-5验收测试!`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 M2-5验证服务器已停止');
  process.exit(0);
});
