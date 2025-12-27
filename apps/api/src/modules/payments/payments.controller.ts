import { Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("intent")
  @ApiOperation({ summary: "Создать платежную сессию в CloudPayments (черновик)" })
  createIntent(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createIntent(dto);
  }

  @Post("cp/webhook")
  @ApiOperation({ summary: "Webhook от CloudPayments (подпись проверяется)" })
  handleCloudPaymentsWebhook(@Body() body: unknown, @Headers("Content-HMAC") signature?: string) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
