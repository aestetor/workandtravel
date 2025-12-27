import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "@opensearch-project/opensearch";
import { ListingStatus } from "@prisma/client";

type SearchParams = {
  city?: string;
  q?: string;
  tags?: string[];
  size?: number;
};

type ListingDocument = {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  tags: string[];
  status: ListingStatus;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
};

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly client: Client;
  private readonly indexName = "listings";
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      node: this.config.get<string>("OPENSEARCH_URL") ?? "http://localhost:9200"
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  private async ensureIndex() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                title: { type: "text", analyzer: "standard" },
                description: { type: "text", analyzer: "standard" },
                city: { type: "keyword" },
                country: { type: "keyword" },
                tags: { type: "keyword" },
                status: { type: "keyword" },
                lat: { type: "float" },
                lng: { type: "float" },
                createdAt: { type: "date" }
              }
            }
          }
        });
        this.logger.log(`Created index ${this.indexName}`);
      }
    } catch (err) {
      this.logger.error(`Failed to ensure index ${this.indexName}`, err as Error);
    }
  }

  async indexListing(doc: ListingDocument) {
    try {
      await this.client.index({
        index: this.indexName,
        id: doc.id,
        refresh: true,
        body: doc
      });
    } catch (err) {
      this.logger.error(`Failed to index listing ${doc.id}`, err as Error);
    }
  }

  async search(params: SearchParams): Promise<string[]> {
    const size = params.size ?? 50;
    const must = [];
    const filter = [{ term: { status: ListingStatus.PUBLISHED } }];

    if (params.q) {
      must.push({
        multi_match: {
          query: params.q,
          fields: ["title^2", "description"]
        }
      });
    }

    if (params.city) {
      filter.push({ term: { city: params.city } });
    }

    if (params.tags && params.tags.length > 0) {
      filter.push({ terms: { tags: params.tags } });
    }

    const query =
      must.length === 0 && filter.length === 1
        ? { match_all: {} }
        : {
            bool: {
              must: must.length ? must : undefined,
              filter
            }
          };

    try {
      const res = await this.client.search({
        index: this.indexName,
        size,
        body: {
          query,
          sort: [{ createdAt: { order: "desc" } }]
        }
      });

      const hits = (res.body as any)?.hits?.hits ?? [];
      return hits.map((h: any) => h._id as string);
    } catch (err) {
      this.logger.error(`Search failed`, err as Error);
      return [];
    }
  }
}
