import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class CreateAvailabilityDto {
  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  slots?: number = 1;
}
