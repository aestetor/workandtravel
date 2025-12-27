import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  listPosts() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" }
    });
  }

  getPost(slug: string) {
    return this.prisma.blogPost.findUnique({ where: { slug } });
  }
}
