import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { MessagingController } from "./messaging.controller";
import { MessagingService } from "./messaging.service";

@Module({
  imports: [PrismaModule],
  providers: [MessagingService],
  controllers: [MessagingController],
  exports: [MessagingService]
})
export class MessagingModule {}
