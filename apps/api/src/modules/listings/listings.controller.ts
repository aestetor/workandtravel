import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";

import { CurrentUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { CreateAvailabilityDto } from "./dto/create-availability.dto";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { ListingsService } from "./listings.service";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiQuery({ name: "city", required: false })
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "tags", required: false, type: [String] })
  list(
    @Query("city") city?: string,
    @Query("q") q?: string,
    @Query("tags") tags?: string[] | string
  ) {
    const tagList = Array.isArray(tags) ? tags : tags ? [tags] : undefined;
    return this.listingsService.list({ city, q, tags: tagList, onlyPublished: true });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me/mine")
  listMine(@CurrentUser() user: { sub: string }) {
    return this.listingsService.listMine(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { sub: string; role: Role }, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @CurrentUser() user: { sub: string; role: Role },
    @Param("id") id: string,
    @Body() dto: UpdateListingDto
  ) {
    return this.listingsService.update(user, id, dto);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.listingsService.getOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(":id/availability")
  addAvailability(
    @CurrentUser() user: { sub: string; role: Role },
    @Param("id") id: string,
    @Body() dto: CreateAvailabilityDto
  ) {
    return this.listingsService.addAvailability(user, id, dto);
  }
}
