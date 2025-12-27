import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApplicationStatus, Role } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: { sub: string; role: Role }, dto: CreateApplicationDto) {
    if (user.role !== Role.TRAVELER) {
      throw new ForbiddenException("Only travelers can apply");
    }
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { hostProfile: { include: { profile: true } } }
    });
    if (!listing) throw new NotFoundException("Listing not found");

    const existing = await this.prisma.application.findFirst({
      where: { listingId: dto.listingId, travelerId: user.sub }
    });
    if (existing) {
      throw new ForbiddenException("Application already exists");
    }

    const application = await this.prisma.application.create({
      data: {
        listingId: dto.listingId,
        travelerId: user.sub,
        message: dto.message
      },
      include: {
        listing: true
      }
    });

    await this.prisma.thread.create({
      data: {
        applicationId: application.id,
        hostId: listing.hostProfile.profile.userId,
        travelerId: user.sub
      }
    });

    return application;
  }

  async myApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { travelerId: userId },
      include: { listing: true, thread: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async hostApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { listing: { hostProfile: { profile: { userId } } } },
      include: { listing: true, traveler: { include: { profile: true } }, thread: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateStatus(
    user: { sub: string; role: Role },
    applicationId: string,
    dto: UpdateApplicationStatusDto
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { listing: { include: { hostProfile: { include: { profile: true } } } } }
    });
    if (!application) throw new NotFoundException("Application not found");
    const isHost = application.listing.hostProfile.profile.userId === user.sub;
    const isTraveler = application.travelerId === user.sub;
    if (!isHost && !isTraveler) throw new ForbiddenException("Not permitted");

    if (dto.status === ApplicationStatus.CANCELLED && !isTraveler) {
      throw new ForbiddenException("Traveler can cancel");
    }

    const isHostDecision =
      dto.status === ApplicationStatus.ACCEPTED || dto.status === ApplicationStatus.REJECTED;
    if (isHostDecision && !isHost) {
      throw new ForbiddenException("Only host can accept/reject");
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status }
    });
  }
}
