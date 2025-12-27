import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { SearchModule } from "../search/search.module";
import { ListingsController } from "./listings.controller";
import { ListingsService } from "./listings.service";

@Module({
  imports: [PrismaModule, SearchModule],
  providers: [ListingsService],
  controllers: [ListingsController],
  exports: [ListingsService]
})
export class ListingsModule {}
