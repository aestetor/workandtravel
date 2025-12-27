import path from "path";

import { Client } from "@opensearch-project/opensearch";
import { ListingStatus, PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const prisma = new PrismaClient();
const client = new Client({
  node: process.env.OPENSEARCH_URL ?? "http://localhost:9200"
});

const indexName = "listings";

async function ensureIndex() {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists.body) {
    await client.indices.create({
      index: indexName,
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
    // eslint-disable-next-line no-console
    console.log(`Created index ${indexName}`);
  }
}

async function run() {
  await ensureIndex();
  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.PUBLISHED }
  });

  // eslint-disable-next-line no-console
  console.log(`Indexing ${listings.length} listings...`);

  for (const listing of listings) {
    await client.index({
      index: indexName,
      id: listing.id,
      refresh: true,
      body: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        city: listing.city,
        country: listing.country,
        tags: listing.tags,
        status: listing.status,
        lat: listing.lat,
        lng: listing.lng,
        createdAt: listing.createdAt.toISOString()
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log("Done");
  await prisma.$disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
