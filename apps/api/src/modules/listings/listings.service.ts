import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ListingStatus, Role } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateAvailabilityDto } from "./dto/create-availability.dto";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { city?: string; q?: string; tags?: string[]; onlyPublished?: boolean }) {
    return this.prisma.listing.findMany({
      where: {
        city: params.city ? { contains: params.city, mode: "insensitive" } : undefined,
        status: params.onlyPublished ? ListingStatus.PUBLISHED : undefined,
        OR: params.q
          ? [
              { title: { contains: params.q, mode: "insensitive" } },
              { description: { contains: params.q, mode: "insensitive" } }
            ]
          : undefined,
        tags: params.tags ? { hasSome: params.tags } : undefined
      },
      include: { photos: true, hostProfile: { include: { profile: true } }, availability: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async listMine(userId: string) {
    const hostProfile = await this.prisma.hostProfile.findFirst({
      where: { profile: { userId } }
    });
    if (!hostProfile) return [];
    return this.prisma.listing.findMany({
      where: { hostProfileId: hostProfile.id },
      include: { photos: true, availability: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(user: { sub: string; role: Role }, dto: CreateListingDto) {
    if (user.role !== Role.HOST) throw new ForbiddenException("Only hosts can create listings");
    const hostProfile = await this.prisma.hostProfile.findFirst({
      where: { profile: { userId: user.sub } }
    });
    if (!hostProfile) {
      throw new ForbiddenException("Host profile required");
    }

    const listing = await this.prisma.listing.create({
      data: {
        hostProfileId: hostProfile.id,
        title: dto.title,
        description: dto.description,
        city: dto.city,
        country: dto.country ?? "Kazakhstan",
        lat: dto.lat,
        lng: dto.lng,
        tags: dto.tags,
        housing: dto.housing,
        meals: dto.meals,
        houseRules: dto.houseRules,
        status: ListingStatus.PUBLISHED,
        photos: dto.photos
          ? {
              create: dto.photos.map((url, idx) => ({ url, sortOrder: idx }))
            }
          : undefined
      },
      include: { photos: true, hostProfile: { include: { profile: true } } }
    });

    return listing;
  }

  async update(
    user: { sub: string; role: Role },
    listingId: string,
    dto: UpdateListingDto
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { hostProfile: { include: { profile: true } } }
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.hostProfile.profile.userId !== user.sub) {
      throw new ForbiddenException("Not your listing");
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        title: dto.title,
        description: dto.description,
        city: dto.city,
        country: dto.country,
        lat: dto.lat,
        lng: dto.lng,
        tags: dto.tags,
        housing: dto.housing,
        meals: dto.meals,
        houseRules: dto.houseRules,
        photos: dto.photos
          ? {
              deleteMany: {},
              create: dto.photos.map((url, idx) => ({ url, sortOrder: idx }))
            }
          : undefined
      },
      include: { photos: true, availability: true }
    });
  }

  async getOne(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        photos: true,
        availability: true,
        hostProfile: { include: { profile: true } }
      }
    });
    if (!listing) throw new NotFoundException("Listing not found");
    return listing;
  }

  async addAvailability(
    user: { sub: string; role: Role },
    listingId: string,
    dto: CreateAvailabilityDto
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { hostProfile: { include: { profile: true } } }
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.hostProfile.profile.userId !== user.sub) {
      throw new ForbiddenException("Not your listing");
    }

    return this.prisma.availability.create({
      data: {
        listingId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        slots: dto.slots ?? 1
      }
    });
  }
}
