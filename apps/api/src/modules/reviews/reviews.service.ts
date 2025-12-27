import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ApplicationStatus } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: { listing: { include: { hostProfile: { include: { profile: true } } } } }
    });
    if (!application) throw new NotFoundException("Application not found");
    if (application.status !== ApplicationStatus.ACCEPTED) {
      throw new ForbiddenException("Only for accepted applications");
    }

    const isTraveler = application.travelerId === userId;
    const isHost = application.listing.hostProfile.profile.userId === userId;
    if (!isTraveler && !isHost) throw new ForbiddenException("Not allowed");

    const toUserId = isTraveler
      ? application.listing.hostProfile.profile.userId
      : application.travelerId;

    const existing = await this.prisma.review.findUnique({
      where: { applicationId: dto.applicationId }
    });
    if (existing) throw new ForbiddenException("Review already exists");

    return this.prisma.review.create({
      data: {
        applicationId: dto.applicationId,
        fromUserId: userId,
        toUserId,
        rating: dto.rating,
        text: dto.text,
        publishedAt: new Date()
      }
    });
  }

  async listForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" }
    });
  }
}
