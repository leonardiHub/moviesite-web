import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private client!: MeiliSearch;
  private moviesIndex!: Index;
  private seriesIndex!: Index;
  private peopleIndex!: Index;
  private readonly logger = new Logger(MeilisearchService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = new MeiliSearch({
        host: this.configService.get('MEILISEARCH_URL', 'http://localhost:7700'),
        apiKey: this.configService.get('MEILISEARCH_API_KEY'),
      });

      // Test connection
      await this.client.health();
      this.logger.log('Meilisearch connection established');

      // Initialize indexes
      await this.initializeIndexes();
    } catch (error) {
      this.logger.error('Failed to connect to Meilisearch:', error);
    }
  }

  async initializeIndexes() {
    // Movies index
    this.moviesIndex = this.client.index('movies');
    await this.moviesIndex.updateSettings({
      searchableAttributes: ['title', 'original_title', 'synopsis', 'genres', 'tags', 'cast', 'directors'],
      filterableAttributes: ['status', 'year', 'age_rating', 'countries', 'languages', 'genres'],
      sortableAttributes: ['year', 'created_at', 'updated_at', 'popularity_score'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'popularity_score:desc',
      ],
      stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      synonyms: {
        'film': ['movie', 'cinema'],
        'movie': ['film', 'cinema'],
        'series': ['show', 'tv show', 'television'],
        'episode': ['ep'],
      },
    });

    // Series index
    this.seriesIndex = this.client.index('series');
    await this.seriesIndex.updateSettings({
      searchableAttributes: ['title', 'synopsis', 'genres', 'tags', 'cast', 'creators'],
      filterableAttributes: ['status', 'genres', 'year_start', 'year_end'],
      sortableAttributes: ['year_start', 'created_at', 'updated_at', 'popularity_score'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'popularity_score:desc',
      ],
    });

    // People index
    this.peopleIndex = this.client.index('people');
    await this.peopleIndex.updateSettings({
      searchableAttributes: ['name'],
      filterableAttributes: ['roles'],
      sortableAttributes: ['name', 'popularity_score'],
    });

    this.logger.log('Meilisearch indexes initialized');
  }

  // Movie operations
  async indexMovie(movie: any) {
    const document = {
      id: movie.id,
      title: movie.title,
      original_title: movie.originalTitle,
      synopsis: movie.synopsis,
      year: movie.year,
      runtime: movie.runtime,
      age_rating: movie.ageRating,
      languages: movie.languages,
      countries: movie.countries,
      status: movie.status,
      genres: movie.genres?.map((g: any) => g.genre.name) || [],
      tags: movie.tags?.map((t: any) => t.tag.name) || [],
      cast: movie.credits?.filter((c: any) => c.role === 'actor').map((c: any) => c.person.name) || [],
      directors: movie.credits?.filter((c: any) => c.role === 'director').map((c: any) => c.person.name) || [],
      poster_url: movie.artworks?.find((a: any) => a.kind === 'poster')?.url,
      backdrop_url: movie.artworks?.find((a: any) => a.kind === 'backdrop')?.url,
      created_at: movie.createdAt,
      updated_at: movie.updatedAt,
      popularity_score: 0, // Calculate based on views, ratings, etc.
    };

    await this.moviesIndex.addDocuments([document]);
  }

  async updateMovie(movieId: string, movie: any) {
    await this.indexMovie({ ...movie, id: movieId });
  }

  async deleteMovie(movieId: string) {
    await this.moviesIndex.deleteDocument(movieId);
  }

  async searchMovies(query: string, filters?: Record<string, any>, options?: any) {
    const searchParams: any = {
      q: query,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      attributesToRetrieve: options?.attributes || ['id', 'title', 'synopsis', 'year', 'poster_url', 'genres'],
    };

    if (filters) {
      const filterArray = [];
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          filterArray.push(`${key} IN [${value.map(v => `"${v}"`).join(', ')}]`);
        } else {
          filterArray.push(`${key} = "${value}"`);
        }
      }
      if (filterArray.length > 0) {
        searchParams.filter = filterArray;
      }
    }

    if (options?.sort) {
      searchParams.sort = options.sort;
    }

    return this.moviesIndex.search(query, searchParams);
  }

  // Series operations
  async indexSeries(series: any) {
    const document = {
      id: series.id,
      title: series.title,
      synopsis: series.synopsis,
      status: series.status,
      genres: series.genres?.map((g: any) => g.genre.name) || [],
      tags: series.tags?.map((t: any) => t.tag.name) || [],
      cast: series.credits?.filter((c: any) => c.role === 'actor').map((c: any) => c.person.name) || [],
      creators: series.credits?.filter((c: any) => c.role === 'creator').map((c: any) => c.person.name) || [],
      poster_url: series.artworks?.find((a: any) => a.kind === 'poster')?.url,
      backdrop_url: series.artworks?.find((a: any) => a.kind === 'backdrop')?.url,
      season_count: series.seasons?.length || 0,
      episode_count: series.seasons?.reduce((acc: number, s: any) => acc + (s.episodes?.length || 0), 0) || 0,
      year_start: series.seasons?.[0]?.year,
      year_end: series.seasons?.[series.seasons.length - 1]?.year,
      created_at: series.createdAt,
      updated_at: series.updatedAt,
      popularity_score: 0,
    };

    await this.seriesIndex.addDocuments([document]);
  }

  async updateSeries(seriesId: string, series: any) {
    await this.indexSeries({ ...series, id: seriesId });
  }

  async deleteSeries(seriesId: string) {
    await this.seriesIndex.deleteDocument(seriesId);
  }

  async searchSeries(query: string, filters?: Record<string, any>, options?: any) {
    const searchParams: any = {
      q: query,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      attributesToRetrieve: options?.attributes || ['id', 'title', 'synopsis', 'year_start', 'poster_url', 'genres', 'season_count'],
    };

    if (filters) {
      const filterArray = [];
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          filterArray.push(`${key} IN [${value.map(v => `"${v}"`).join(', ')}]`);
        } else {
          filterArray.push(`${key} = "${value}"`);
        }
      }
      if (filterArray.length > 0) {
        searchParams.filter = filterArray;
      }
    }

    return this.seriesIndex.search(query, searchParams);
  }

  // People operations
  async indexPerson(person: any) {
    const document = {
      id: person.id,
      name: person.name,
      avatar: person.avatar,
      roles: person.credits?.map((c: any) => c.role) || [],
      movie_count: person.credits?.filter((c: any) => c.movieId).length || 0,
      series_count: person.credits?.filter((c: any) => c.seriesId).length || 0,
      popularity_score: 0,
    };

    await this.peopleIndex.addDocuments([document]);
  }

  async updatePerson(personId: string, person: any) {
    await this.indexPerson({ ...person, id: personId });
  }

  async deletePerson(personId: string) {
    await this.peopleIndex.deleteDocument(personId);
  }

  async searchPeople(query: string, filters?: Record<string, any>, options?: any) {
    const searchParams: any = {
      q: query,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };

    if (filters) {
      const filterArray = [];
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          filterArray.push(`${key} IN [${value.map(v => `"${v}"`).join(', ')}]`);
        } else {
          filterArray.push(`${key} = "${value}"`);
        }
      }
      if (filterArray.length > 0) {
        searchParams.filter = filterArray;
      }
    }

    return this.peopleIndex.search(query, searchParams);
  }

  // Global search across all indexes
  async globalSearch(query: string, options?: any) {
    const [movies, series, people] = await Promise.all([
      this.searchMovies(query, {}, { limit: options?.movieLimit || 5 }),
      this.searchSeries(query, {}, { limit: options?.seriesLimit || 5 }),
      this.searchPeople(query, {}, { limit: options?.peopleLimit || 5 }),
    ]);

    return {
      movies: movies.hits,
      series: series.hits,
      people: people.hits,
      total: (movies.estimatedTotalHits || 0) + (series.estimatedTotalHits || 0) + (people.estimatedTotalHits || 0),
    };
  }

  // Analytics
  async getSearchAnalytics(startDate?: Date, endDate?: Date) {
    // This would integrate with your analytics system
    // For now, return mock data structure
    return {
      topQueries: [],
      noResultsQueries: [],
      searchVolume: 0,
      avgResultsPerQuery: 0,
      clickThroughRate: 0,
    };
  }

  // Index management
  async reindexAll() {
    await Promise.all([
      this.moviesIndex.deleteAllDocuments(),
      this.seriesIndex.deleteAllDocuments(),
      this.peopleIndex.deleteAllDocuments(),
    ]);

    this.logger.log('All indexes cleared for reindexing');
    // Trigger reindexing from database
    // This would be implemented in your content service
  }

  async getIndexStats() {
    const [moviesStats, seriesStats, peopleStats] = await Promise.all([
      this.moviesIndex.getStats(),
      this.seriesIndex.getStats(),
      this.peopleIndex.getStats(),
    ]);

    return {
      movies: moviesStats,
      series: seriesStats,
      people: peopleStats,
    };
  }

  // Get client for advanced operations
  getClient(): MeiliSearch {
    return this.client;
  }
}
