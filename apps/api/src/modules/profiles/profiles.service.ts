import { Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { UpdateHostProfileDto } from "./dto/update-host-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { hostProfile: true } } }
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.prisma.profile.update({
      where: { userId },
      data: {
        name: dto.name,
        bio: dto.bio,
        languages: dto.languages,
        skills: dto.skills,
        city: dto.city,
        country: dto.country,
        photoUrl: dto.photoUrl
      }
    });
  }

  async upsertHostProfile(userId: string, dto: UpdateHostProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { hostProfile: true } } }
    });
    if (!user) throw new NotFoundException("User not found");
    if (user.role !== Role.HOST) throw new NotFoundException("Host profile available for HOST only");

    if (user.profile?.hostProfile) {
      return this.prisma.hostProfile.update({
        where: { id: user.profile.hostProfile.id },
        data: {
          houseRules: dto.houseRules,
          amenities: dto.amenities,
          dietary: dto.dietary,
          householdSize: dto.householdSize
        }
      });
    }

    return this.prisma.hostProfile.create({
      data: {
        profileId: user.profile?.id ?? "",
        houseRules: dto.houseRules,
        amenities: dto.amenities,
        dietary: dto.dietary,
        householdSize: dto.householdSize
      }
    });
  }
}
