import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";

import { CurrentUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import { ApplicationsService } from "./applications.service";

@ApiTags("applications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string; role: Role }, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user, dto);
  }

  @Get("me")
  myApplications(@CurrentUser() user: { sub: string }) {
    return this.applicationsService.myApplications(user.sub);
  }

  @Get("host")
  hostApplications(@CurrentUser() user: { sub: string }) {
    return this.applicationsService.hostApplications(user.sub);
  }

  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: { sub: string; role: Role },
    @Param("id") id: string,
    @Body() dto: UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(user, id, dto);
  }
}
