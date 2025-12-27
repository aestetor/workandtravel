import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ContentService } from "./content.service";

@ApiTags("content")
@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("posts")
  listPosts() {
    return this.contentService.listPosts();
  }

  @Get("posts/:slug")
  getPost(@Param("slug") slug: string) {
    return this.contentService.getPost(slug);
  }
}
