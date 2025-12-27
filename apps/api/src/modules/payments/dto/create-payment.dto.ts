import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({ description: "ID заявки (applicationId)" })
  @IsString()
  @MinLength(3)
  applicationId!: string;

  @ApiProperty({ description: "Сумма комиссии в KZT" })
  @IsInt()
  @IsPositive()
  amountKzt!: number;

  @ApiProperty({ description: "ID пользователя, инициирующего оплату" })
  @IsString()
  @MinLength(3)
  userId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
