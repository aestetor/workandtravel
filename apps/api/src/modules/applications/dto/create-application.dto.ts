import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  listingId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  message!: string;
}
