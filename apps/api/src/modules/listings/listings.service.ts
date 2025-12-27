import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ListingStatus, Role } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateAvailabilityDto } from "./dto/create-availability.dto";
import { CreateListingDto } from "./dto/create-listing.dto";
import { UpdateListingDto } from "./dto/update-listing.dto";
import { SearchService } from "../search/search.service";

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService
  ) {}

  async list(params: { city?: string; q?: string; tags?: string[]; onlyPublished?: boolean }) {
    const ids = await this.searchService.search({
      city: params.city,
      q: params.q,
      tags: params.tags,
      size: 50
    });

    if (ids.length === 0) {
      // Fallback to DB when index is empty or no hits
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

    const listings = await this.prisma.listing.findMany({
      where: {
        id: { in: ids },
        status: params.onlyPublished ? ListingStatus.PUBLISHED : undefined
      },
      include: { photos: true, hostProfile: { include: { profile: true } }, availability: true }
    });

    const order = new Map(ids.map((id, idx) => [id, idx]));
    return listings.sort(
      (a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );
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

    await this.searchService.indexListing({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      city: listing.city,
      country: listing.country,
      tags: listing.tags,
      status: listing.status,
      lat: listing.lat,
      lng: listing.lng,
      createdAt: listing.createdAt.toISOString()
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

    const updated = await this.prisma.listing.update({
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

    await this.searchService.indexListing({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      city: updated.city,
      country: updated.country,
      tags: updated.tags,
      status: updated.status,
      lat: updated.lat,
      lng: updated.lng,
      createdAt: updated.createdAt.toISOString()
    });

    return updated;
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
