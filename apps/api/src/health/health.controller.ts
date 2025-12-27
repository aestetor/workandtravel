import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { SearchService } from "../modules/search/search.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService
  ) {}

  @Get()
  async health() {
    const checks = {
      db: false,
      search: false
    };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.db = true;
    } catch (err) {
      checks.db = false;
    }

    const searchResult = await this.searchService.checkHealth();
    checks.search = searchResult.ok;

    const healthy = checks.db && checks.search;
    if (!healthy) {
      throw new HttpException(
        {
          status: "degraded",
          ...checks,
          searchStatus: searchResult
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return {
      status: "ok",
      ...checks,
      searchStatus: searchResult
    };
  }
}
