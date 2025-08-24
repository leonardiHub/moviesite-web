const http = require('http');
const url = require('url');

// Mock data
const mockData = {
  home: {
    brand: { 
      name: 'EZ Movie', 
      logo: { light: '/cdn/brand/logo-light.svg', dark: '/cdn/brand/logo-dark.svg' },
      palette: { primary: '#E50914', bg: '#0a0c12', text: '#e6e9f2' } 
    },
    sponsors: [
      { placement: 'home_hero', image: '/cdn/sponsor/hero-1.png', url: 'https://ezlotto.xyz' }
    ],
    sections: [
      { id: 'hero', kind: 'hero', items: [{ id: 'm1', title: 'John Wick 4', backdrop: '/cdn/m/m1/backdrop.jpg', year: 2023 }] },
      { id: 'popular', kind: 'slider', title: 'หนังยอดนิยม', items: [{ id: 'm2', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', rating: 8.0, year: 2021 }] }
    ]
  },
  movies: {
    items: [
      { id: 'm1', slug: 'john-wick-4', title: 'John Wick 4', poster: '/cdn/m/m1/poster.jpg', year: 2023, rating: 8.5, genres: ['Action'] },
      { id: 'm2', slug: 'dune', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', year: 2021, rating: 8.0, genres: ['Sci-Fi'] }
    ],
    page: 1, limit: 24, total: 2, hasMore: false
  },
  movieDetail: {
    id: 'm2', title: 'Dune', year: 2021, runtime: 155, rating: 8.0,
    synopsis: 'ในอนาคตอันไกลโพ้น...',
    poster: '/cdn/m/m2/poster.jpg', backdrop: '/cdn/m/m2/backdrop.jpg',
    genres: ['Sci-Fi'], tags: ['พากย์ไทย'], 
    cast: [{ id: 'p1', name: 'Timothée Chalamet' }],
    crew: [{ id: 'p9', name: 'Denis Villeneuve' }],
    related: []
  },
  playAuth: {
    sessionId: 'play_sess_' + Date.now(),
    expiresIn: 900,
    sources: [{ type: 'hls', url: 'https://cdn.example.com/m2/master.m3u8' }],
    subtitles: [{ lang: 'th', label: 'Thai', url: 'https://cdn.example.com/m2/subs/th.vtt', default: true }],
    audios: [{ lang: 'th', label: 'Thai' }],
    drm: null,
    sponsorOverlays: []
  },
  brand: {
    name: 'EZ Movie',
    logo: { light: '/cdn/brand/logo-light.svg', dark: '/cdn/brand/logo-dark.svg' },
    palette: { primary: '#E50914', bg: '#0A0C12', text: '#E6E9F2' },
    fontFamily: 'Kanit, Inter',
    favicon: '/cdn/brand/favicon.ico'
  },
  sponsors: [
    { id: 'sp1', placement: 'home_hero', page: 'home', type: 'banner', 
      image: '/cdn/sponsors/ez-casino.png', url: 'https://ezcasino.run', active: true }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Routes
  if (path === '/v1/home') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.home));
  } 
  else if (path === '/v1/movies') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.movies));
  }
  else if (path.startsWith('/v1/movies/') && path.endsWith('/play')) {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.playAuth));
  }
  else if (path.startsWith('/v1/movies/')) {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.movieDetail));
  }
  else if (path === '/v1/brand') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.brand));
  }
  else if (path === '/v1/sponsors/placements') {
    const page = parsedUrl.query.page;
    const filtered = page ? mockData.sponsors.filter(s => s.page === page) : mockData.sponsors;
    res.writeHead(200);
    res.end(JSON.stringify(filtered));
  }
  else if (path === '/v1/openapi.json') {
    const openapi = {
      openapi: '3.0.0',
      info: { title: 'EZ Movie API', version: '1.0' },
      paths: {
        '/v1/home': { get: { summary: 'Homepage data' } },
        '/v1/movies': { get: { summary: 'Movies list' } },
        '/v1/movies/{id}': { get: { summary: 'Movie detail' } },
        '/v1/movies/{id}/play': { get: { summary: 'Play authorization' } },
        '/v1/brand': { get: { summary: 'Brand config' } },
        '/v1/sponsors/placements': { get: { summary: 'Sponsor placements' } }
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(openapi));
  }
  else if (path === '/docs') {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
<!DOCTYPE html>
<html><head><title>EZ Movie API Docs</title></head>
<body>
  <h1>🎬 EZ Movie API Documentation</h1>
  <h2>Available Endpoints:</h2>
  <ul>
    <li><a href="/v1/home">GET /v1/home</a> - Homepage data</li>
    <li><a href="/v1/movies">GET /v1/movies</a> - Movies list</li>
    <li><a href="/v1/movies/m2">GET /v1/movies/:id</a> - Movie detail</li>
    <li><a href="/v1/movies/m2/play">GET /v1/movies/:id/play</a> - Play authorization</li>
    <li><a href="/v1/brand">GET /v1/brand</a> - Brand configuration</li>
    <li><a href="/v1/sponsors/placements">GET /v1/sponsors/placements</a> - Sponsor placements</li>
    <li><a href="/v1/openapi.json">GET /v1/openapi.json</a> - OpenAPI specification</li>
  </ul>
  <p><strong>✅ M1 Verification Server Ready!</strong></p>
</body></html>
    `);
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 EZ Movie API Verification Server running on http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
  console.log(`✅ M1 Ready for verification!`);
});
