const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { nanoid } = require('nanoid');

const app = express();

// M1验证版本 - 简化配置
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: 60_000,
  max: 300,
}));

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Global prefix v1
const router = express.Router();

// 首页API
router.get('/home', (req, res) => {
  res.json({
    brand: { 
      name: 'EZ Movie', 
      logo: { light: '/cdn/brand/logo-light.svg', dark: '/cdn/brand/logo-dark.svg' },
      palette: { primary: '#E50914', bg: '#0a0c12', text: '#e6e9f2' } 
    },
    sponsors: [
      { placement: 'home_hero', image: '/cdn/sponsor/hero-1.png', url: 'https://ezlotto.xyz/aff/ez993605?action=register' }
    ],
    sections: [
      { id: 'hero', kind: 'hero', items: [{ id: 'm1', title: 'John Wick 4', backdrop: '/cdn/m/m1/backdrop.jpg', year: 2023 }] },
      { id: 'popular', kind: 'slider', title: 'หนังยอดนิยม', items: [{ id: 'm2', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', rating: 8.0, year: 2021 }] }
    ]
  });
});

// 电影列表API
router.get('/movies', (req, res) => {
  const mockMovies = [
    { id: 'm1', slug: 'john-wick-4', title: 'John Wick 4', poster: '/cdn/m/m1/poster.jpg', year: 2023, rating: 8.5, genres: ['Action', 'Thriller'] },
    { id: 'm2', slug: 'dune', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', year: 2021, rating: 8.0, genres: ['Sci-Fi', 'Adventure'] }
  ];
  
  res.json({ 
    items: mockMovies.slice(0, req.query.limit || 24),
    page: 1, 
    limit: Number(req.query.limit) || 24, 
    total: mockMovies.length, 
    hasMore: false 
  });
});

// 电影详情API
router.get('/movies/:id', (req, res) => {
  res.json({
    id: req.params.id,
    title: 'Dune',
    originalTitle: 'Dune',
    year: 2021,
    runtime: 155,
    rating: 8.0,
    synopsis: 'ในอนาคตอันไกลโพ้น...',
    poster: '/cdn/m/m2/poster.jpg',
    backdrop: '/cdn/m/m2/backdrop.jpg',
    genres: ['Sci-Fi', 'Adventure'],
    tags: ['พากย์ไทย', 'ซับไทย'],
    cast: [{ id: 'p1', name: 'Timothée Chalamet', character: 'Paul Atreides' }],
    crew: [{ id: 'p9', name: 'Denis Villeneuve', role: 'Director' }],
    related: [{ id: 'm10', title: 'Blade Runner 2049', poster: '/cdn/m/m10/poster.jpg' }]
  });
});

// 播放授权API
router.get('/movies/:id/play', (req, res) => {
  res.json({
    sessionId: 'play_sess_' + nanoid(),
    expiresIn: 900,
    sources: [
      { type: 'hls', url: `https://cdn.your-domain.com/${req.params.id}/master.m3u8`, cdn: 'cloudfront' }
    ],
    subtitles: [
      { lang: 'th', label: 'Thai', url: `https://cdn.your-domain.com/${req.params.id}/subs/th.vtt`, default: true }
    ],
    audios: [{ lang: 'th', label: 'Thai' }],
    drm: null,
    sponsorOverlays: [
      { start: 5, duration: 8, image: 'https://cdn.your-domain.com/sponsors/overlay-1.png', clickUrl: 'https://ezlotto.xyz/aff/ez993605?action=register' }
    ]
  });
});

// 品牌API
router.get('/brand', (req, res) => {
  res.json({
    name: 'EZ Movie',
    logo: { light: '/cdn/brand/logo-light.svg', dark: '/cdn/brand/logo-dark.svg', mono: '/cdn/brand/logo-mono.svg' },
    palette: { primary: '#E50914', accent: '#FF3341', bg: '#0A0C12', text: '#E6E9F2' },
    fontFamily: 'Kanit, Inter, system-ui',
    favicon: '/cdn/brand/favicon.ico',
    ogImage: '/cdn/brand/og.jpg'
  });
});

// 赞助商API
router.get('/sponsors/placements', (req, res) => {
  const placements = [
    { id: 'sp1', placement: 'home_hero', page: 'home', position: 'hero_banner', type: 'banner', image: '/cdn/sponsors/ez-casino-hero.png', url: 'https://ezcasino.run/aff/ez993605?action=register', title: 'EZ Casino', active: true, priority: 1 }
  ];
  
  const filtered = req.query.page ? placements.filter(p => p.page === req.query.page) : placements;
  res.json(filtered);
});

// 静态CDN文件服务
app.use('/cdn', express.static('./public/cdn', { maxAge: '30d' }));

// OpenAPI JSON
router.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: { title: 'EZ Movie API', version: '1.0' },
    paths: {
      '/v1/home': { get: { summary: 'Get homepage data' } },
      '/v1/movies': { get: { summary: 'List movies' } },
      '/v1/movies/{id}': { get: { summary: 'Get movie details' } },
      '/v1/movies/{id}/play': { get: { summary: 'Get playback authorization' } },
      '/v1/brand': { get: { summary: 'Get brand configuration' } },
      '/v1/sponsors/placements': { get: { summary: 'Get sponsor placements' } }
    }
  });
});

// Swagger文档页面
app.get('/docs', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>EZ Movie API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/v1/openapi.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone]
    });
  </script>
</body>
</html>
  `);
});

app.use('/v1', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 EZ Movie API is running on: http://localhost:${PORT}/v1`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🗂️ OpenAPI JSON: http://localhost:${PORT}/v1/openapi.json`);
  console.log(`✅ M1 Verification Server Ready!`);
});
