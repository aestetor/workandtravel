import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  attachments?: Record<string, unknown>;
}
