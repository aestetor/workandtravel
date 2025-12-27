import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateHostProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  houseRules?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  dietary?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  householdSize?: number;
}
