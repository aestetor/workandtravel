import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessagingService } from "./messaging.service";

@ApiTags("messaging")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get("threads")
  listThreads(@CurrentUser() user: { sub: string }) {
    return this.messagingService.listThreads(user.sub);
  }

  @Get("threads/:id")
  getThread(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
    return this.messagingService.getThread(user.sub, id);
  }

  @Post("threads/:id/messages")
  sendMessage(
    @CurrentUser() user: { sub: string },
    @Param("id") id: string,
    @Body() dto: CreateMessageDto
  ) {
    return this.messagingService.sendMessage(user.sub, id, dto);
  }
}
