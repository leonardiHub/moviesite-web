# @moviesite/sdk

EZ Movie Platform SDK - 前端API客户端

## 安装

```bash
# 从工作区根目录
cd packages/sdk
npm install
npm run build
```

## 使用

### 1. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE=http://localhost:4000/v1
```

### 2. 基础使用

```typescript
import { home, movies, brand, sponsor } from '@moviesite/sdk';

// 获取首页数据
const homeData = await home.get();

// 获取电影列表
const moviesList = await movies.list({ 
  page: 1, 
  limit: 24, 
  genre: 'Action' 
});

// 获取电影详情
const movieDetail = await movies.detail('m2');

// 获取播放授权
const playAuth = await movies.play('m2');

// 获取品牌配置
const brandConfig = await brand.get();

// 获取赞助商投放位
const sponsors = await sponsor.getPlacements({ page: 'home' });
```

### 3. React Query 集成

```typescript
import { useQuery } from '@tanstack/react-query';
import { home, movies } from '@moviesite/sdk';

// 首页数据
const { data: homeData, isLoading } = useQuery({
  queryKey: ['home'],
  queryFn: home.get
});

// 电影列表
const { data: moviesList } = useQuery({
  queryKey: ['movies', { page: 1, genre: 'Action' }],
  queryFn: () => movies.list({ page: 1, genre: 'Action' })
});
```

## API契约

所有API接口已冻结，字段结构不会变更：

- `GET /v1/home` - 首页数据
- `GET /v1/movies` - 电影列表  
- `GET /v1/movies/:id` - 电影详情
- `GET /v1/movies/:id/play` - 播放授权
- `GET /v1/brand` - 品牌配置
- `GET /v1/sponsors/placements` - 赞助商投放位
