import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { ContentController } from "./content.controller";
import { ContentService } from "./content.service";

@Module({
  imports: [PrismaModule],
  providers: [ContentService],
  controllers: [ContentController],
  exports: [ContentService]
})
export class ContentModule {}
