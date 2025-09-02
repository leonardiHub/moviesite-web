import { Injectable } from "@nestjs/common";
import { MeilisearchService } from "../meilisearch/meilisearch.service";

@Injectable()
export class SearchService {
  constructor(private readonly ms: MeilisearchService) {}

  async reindex() {
    await this.ms.reindexAll();
    return { ok: true };
  }

  async synonyms(syns: Record<string, string[]>) {
    // Meili 设置同义词：这里简化为 movies 索引
    const client = this.ms.getClient();
    if (!client) {
      throw new Error("Meilisearch client is not available");
    }
    await client.index("movies").updateSettings({ synonyms: syns });
    return { ok: true };
  }
}
