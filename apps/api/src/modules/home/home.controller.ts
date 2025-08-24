import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  @Get()
  @ApiOperation({ summary: 'Get homepage data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Homepage data including brand, sponsors, and content sections',
    schema: {
      type: 'object',
      properties: {
        brand: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            logo: {
              type: 'object',
              properties: {
                light: { type: 'string' },
                dark: { type: 'string' }
              }
            },
            palette: {
              type: 'object', 
              properties: {
                primary: { type: 'string' },
                bg: { type: 'string' },
                text: { type: 'string' }
              }
            }
          }
        },
        sponsors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              placement: { type: 'string' },
              image: { type: 'string' },
              url: { type: 'string' }
            }
          }
        },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              kind: { type: 'string' },
              title: { type: 'string' },
              items: { type: 'array' }
            }
          }
        }
      }
    }
  })
  async getHome() {
    // TODO: 从 DB/缓存取
    return {
      brand: { 
        name: 'EZ Movie', 
        logo: { 
          light: '/cdn/brand/logo-light.svg', 
          dark: '/cdn/brand/logo-dark.svg' 
        },
        palette: { 
          primary: '#E50914', 
          bg: '#0a0c12', 
          text: '#e6e9f2' 
        } 
      },
      sponsors: [
        { 
          placement: 'home_hero', 
          image: '/cdn/sponsor/hero-1.png', 
          url: 'https://ezlotto.xyz/aff/ez993605?action=register' 
        },
        { 
          placement: 'home_sidebar', 
          image: '/cdn/sponsor/sidebar-1.png', 
          url: 'https://ezslot.ai/aff/ez993605?action=register' 
        }
      ],
      sections: [
        { 
          id: 'hero', 
          kind: 'hero', 
          items: [
            { 
              id: 'm1', 
              title: 'John Wick 4', 
              backdrop: '/cdn/m/m1/backdrop.jpg', 
              year: 2023,
              rating: 8.5,
              synopsis: 'John Wick uncovers a path to defeating The High Table...'
            }
          ] 
        },
        { 
          id: 'popular', 
          kind: 'slider', 
          title: 'หนังยอดนิยม', 
          items: [
            { 
              id: 'm2', 
              title: 'Dune', 
              poster: '/cdn/m/m2/poster.jpg', 
              rating: 8.0, 
              year: 2021,
              genres: ['Sci-Fi', 'Adventure']
            },
            { 
              id: 'm3', 
              title: 'Spider-Man: No Way Home', 
              poster: '/cdn/m/m3/poster.jpg', 
              rating: 8.2, 
              year: 2021,
              genres: ['Action', 'Adventure']
            },
            { 
              id: 'm4', 
              title: 'The Batman', 
              poster: '/cdn/m/m4/poster.jpg', 
              rating: 7.8, 
              year: 2022,
              genres: ['Action', 'Crime']
            }
          ] 
        },
        { 
          id: 'top10', 
          kind: 'top10', 
          title: 'Top 10 ในไทย',
          country: 'TH', 
          items: [
            { id: 'm5', title: 'ปุกเกิด ตีหมื่น', poster: '/cdn/m/m5/poster.jpg', rating: 7.5, rank: 1 },
            { id: 'm6', title: 'หลวงพี่แจ๊ส 5G', poster: '/cdn/m/m6/poster.jpg', rating: 7.2, rank: 2 },
            { id: 'm7', title: 'Fast X', poster: '/cdn/m/m7/poster.jpg', rating: 6.8, rank: 3 },
            { id: 'm8', title: 'Guardians of the Galaxy Vol. 3', poster: '/cdn/m/m8/poster.jpg', rating: 8.1, rank: 4 },
            { id: 'm9', title: 'Scream VI', poster: '/cdn/m/m9/poster.jpg', rating: 6.5, rank: 5 },
            { id: 'm10', title: 'Avatar: The Way of Water', poster: '/cdn/m/m10/poster.jpg', rating: 7.6, rank: 6 },
            { id: 'm11', title: 'Black Panther: Wakanda Forever', poster: '/cdn/m/m11/poster.jpg', rating: 6.7, rank: 7 },
            { id: 'm12', title: 'Top Gun: Maverick', poster: '/cdn/m/m12/poster.jpg', rating: 8.3, rank: 8 },
            { id: 'm13', title: 'Doctor Strange in the Multiverse of Madness', poster: '/cdn/m/m13/poster.jpg', rating: 6.9, rank: 9 },
            { id: 'm14', title: 'Thor: Love and Thunder', poster: '/cdn/m/m14/poster.jpg', rating: 6.2, rank: 10 }
          ] 
        },
        {
          id: 'thai_movies',
          kind: 'slider',
          title: 'หนังไทย',
          items: [
            { id: 'm15', title: 'แสงกระสือ', poster: '/cdn/m/m15/poster.jpg', rating: 6.8, year: 2019 },
            { id: 'm16', title: 'บ้านฉัน ตลกไว้ก่อน (พ่อสอนไว้)', poster: '/cdn/m/m16/poster.jpg', rating: 7.1, year: 2020 }
          ]
        },
        {
          id: 'anime',
          kind: 'slider', 
          title: 'อนิเมะ',
          items: [
            { id: 'm17', title: 'Demon Slayer: Mugen Train', poster: '/cdn/m/m17/poster.jpg', rating: 8.7, year: 2020 },
            { id: 'm18', title: 'Your Name', poster: '/cdn/m/m18/poster.jpg', rating: 8.4, year: 2016 }
          ]
        }
      ]
    };
  }
}
