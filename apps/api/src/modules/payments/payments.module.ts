import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaModule } from "../../prisma/prisma.module";
import { CloudPaymentsProvider } from "./providers/cloudpayments.provider";
import { PAYMENT_PROVIDER } from "./payment.tokens";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [PrismaModule],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new CloudPaymentsProvider({
          publicId: config.get("CLOUDPAYMENTS_PUBLIC_ID") ?? "",
          secret: config.get("CLOUDPAYMENTS_SECRET") ?? ""
        })
    }
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule {}
