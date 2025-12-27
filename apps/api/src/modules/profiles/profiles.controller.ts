import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { UpdateHostProfileDto } from "./dto/update-host-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get("me")
  me(@CurrentUser() user: { sub: string }) {
    return this.profilesService.getMe(user.sub);
  }

  @Put("me")
  updateProfile(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(user.sub, dto);
  }

  @Put("me/host")
  upsertHostProfile(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateHostProfileDto
  ) {
    return this.profilesService.upsertHostProfile(user.sub, dto);
  }
}
