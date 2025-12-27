import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async listThreads(userId: string) {
    return this.prisma.thread.findMany({
      where: { OR: [{ hostId: userId }, { travelerId: userId }] },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        application: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getThread(userId: string, threadId: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
      include: { messages: { orderBy: { createdAt: "asc" } }, application: true }
    });
    if (!thread) throw new NotFoundException("Thread not found");
    if (thread.hostId !== userId && thread.travelerId !== userId) {
      throw new ForbiddenException("Not allowed");
    }
    return thread;
  }

  async sendMessage(userId: string, threadId: string, dto: CreateMessageDto) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId }
    });
    if (!thread) throw new NotFoundException("Thread not found");
    if (thread.hostId !== userId && thread.travelerId !== userId) {
      throw new ForbiddenException("Not allowed");
    }
    return this.prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        body: dto.body,
        attachments: dto.attachments
      }
    });
  }
}
