import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Brand & Sponsors')
@Controller()
export class BrandController {
  @Get('brand')
  @ApiOperation({ summary: 'Get brand configuration' })
  @ApiResponse({ 
    status: 200, 
    description: 'Brand configuration including colors, logos, and fonts',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        logo: {
          type: 'object',
          properties: {
            light: { type: 'string' },
            dark: { type: 'string' },
            mono: { type: 'string' }
          }
        },
        palette: {
          type: 'object',
          properties: {
            primary: { type: 'string' },
            accent: { type: 'string' },
            bg: { type: 'string' },
            text: { type: 'string' }
          }
        },
        fontFamily: { type: 'string' },
        favicon: { type: 'string' },
        ogImage: { type: 'string' }
      }
    }
  })
  async getBrand() {
    // TODO: 从 DB 获取品牌配置
    return {
      name: 'EZ Movie',
      logo: {
        light: '/cdn/brand/logo-light.svg',
        dark: '/cdn/brand/logo-dark.svg', 
        mono: '/cdn/brand/logo-mono.svg'
      },
      palette: {
        primary: '#E50914',
        accent: '#FF3341',
        bg: '#0A0C12',
        text: '#E6E9F2'
      },
      fontFamily: 'Kanit, Inter, system-ui, -apple-system, Segoe UI, Roboto',
      favicon: '/cdn/brand/favicon.ico',
      ogImage: '/cdn/brand/og.jpg'
    };
  }

  @Get('sponsors/placements')
  @ApiOperation({ summary: 'Get sponsor placements for specific pages' })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Page context: home, detail, player, catalog' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sponsor placements filtered by page context',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          placement: { type: 'string' },
          page: { type: 'string' },
          position: { type: 'string' },
          type: { type: 'string' },
          image: { type: 'string' },
          url: { type: 'string' },
          title: { type: 'string' },
          active: { type: 'boolean' },
          priority: { type: 'number' }
        }
      }
    }
  })
  async getSponsorPlacements(@Query('page') page?: string) {
    // TODO: 从 DB 获取赞助商配置，根据页面和优先级筛选
    const allPlacements = [
      // Home page placements
      {
        id: 'sp1',
        placement: 'home_hero',
        page: 'home',
        position: 'hero_banner',
        type: 'banner',
        image: '/cdn/sponsors/ez-casino-hero.png',
        url: 'https://ezcasino.run/aff/ez993605?action=register',
        title: 'EZ Casino - สมัครสมาชิกรับโบนัส',
        active: true,
        priority: 1
      },
      {
        id: 'sp2',
        placement: 'home_sidebar',
        page: 'home',
        position: 'sidebar_top',
        type: 'banner',
        image: '/cdn/sponsors/ez-slot-sidebar.png',
        url: 'https://ezslot.ai/aff/ez993605?action=register',
        title: 'EZ Slot - เล่นสล็อตออนไลน์',
        active: true,
        priority: 2
      },
      {
        id: 'sp3',
        placement: 'home_footer',
        page: 'home',
        position: 'footer_banner',
        type: 'banner',
        image: '/cdn/sponsors/ez-lotto-footer.png',
        url: 'https://ezlotto.xyz/aff/ez993605?action=register',
        title: 'EZ Lotto - หวยออนไลน์',
        active: true,
        priority: 3
      },

      // Movie detail page placements
      {
        id: 'sp4',
        placement: 'detail_top',
        page: 'detail',
        position: 'above_player',
        type: 'banner',
        image: '/cdn/sponsors/1ufa-detail.png',
        url: 'https://1ufabet.run/aff/1ufa9950?action=register',
        title: '1UFABET - แทงบอลออนไลน์',
        active: true,
        priority: 1
      },
      {
        id: 'sp5',
        placement: 'detail_bottom',
        page: 'detail',
        position: 'below_info',
        type: 'banner',
        image: '/cdn/sponsors/ez-casino-detail.png',
        url: 'https://ezcasino.run/aff/ez993605?action=register',
        title: 'EZ Casino - บาคาร่าออนไลน์',
        active: true,
        priority: 2
      },

      // Player page placements
      {
        id: 'sp6',
        placement: 'player_preroll',
        page: 'player',
        position: 'video_preroll',
        type: 'video_overlay',
        image: '/cdn/sponsors/ez-slot-overlay.png',
        url: 'https://ezslot.ai/aff/ez993605?action=register',
        title: 'EZ Slot',
        active: true,
        priority: 1
      },
      {
        id: 'sp7',
        placement: 'player_midroll',
        page: 'player',
        position: 'video_midroll',
        type: 'video_overlay',
        image: '/cdn/sponsors/ez-lotto-overlay.png',
        url: 'https://ezlotto.xyz/aff/ez993605?action=register',
        title: 'EZ Lotto',
        active: true,
        priority: 2
      },

      // Catalog page placements  
      {
        id: 'sp8',
        placement: 'catalog_header',
        page: 'catalog',
        position: 'page_header',
        type: 'banner',
        image: '/cdn/sponsors/1ufa-catalog.png',
        url: 'https://1ufabet.run/aff/1ufa9950?action=register',
        title: '1UFABET',
        active: true,
        priority: 1
      },
      {
        id: 'sp9',
        placement: 'catalog_grid',
        page: 'catalog',
        position: 'between_movies',
        type: 'native_ad',
        image: '/cdn/sponsors/ez-casino-native.png',
        url: 'https://ezcasino.run/aff/ez993605?action=register',
        title: 'EZ Casino - ลิงค์สำรอง',
        active: true,
        priority: 2
      }
    ];

    // Filter by page if specified
    if (page) {
      return allPlacements
        .filter(placement => placement.page === page && placement.active)
        .sort((a, b) => a.priority - b.priority);
    }

    // Return all active placements
    return allPlacements
      .filter(placement => placement.active)
      .sort((a, b) => a.priority - b.priority);
  }
}