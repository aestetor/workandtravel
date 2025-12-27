import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { ApplicationsController } from "./applications.controller";
import { ApplicationsService } from "./applications.service";

@Module({
  imports: [PrismaModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService]
})
export class ApplicationsModule {}
