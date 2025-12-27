import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ApplicationStatus, PaymentStatus } from "@prisma/client";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentIntent, PaymentProvider } from "./payment.provider";
import { PAYMENT_PROVIDER } from "./payment.tokens";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly prisma: PrismaService
  ) {}

  async createIntent(dto: CreatePaymentDto): Promise<PaymentIntent> {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId }
    });
    if (!application) {
      throw new NotFoundException("Application not found");
    }

    const intent = await this.provider.createPaymentIntent({
      applicationId: dto.applicationId,
      amountKzt: dto.amountKzt,
      description: dto.description,
      userId: dto.userId
    });

    await this.prisma.payment.create({
      data: {
        applicationId: dto.applicationId,
        userId: dto.userId,
        amountKzt: dto.amountKzt,
        status: PaymentStatus.INITIATED,
        cpTransactionId: intent.externalId
      }
    });

    return intent;
  }

  async handleWebhook(rawBody: unknown, signature?: string) {
    const result = await this.provider.handleWebhook(rawBody, signature);
    if (result.status === PaymentStatus.PAID) {
      const payment = await this.prisma.payment.findFirst({
        where: result.applicationId
          ? { applicationId: result.applicationId }
          : { cpTransactionId: result.transactionId }
      });
      if (!payment) {
        throw new NotFoundException("Payment not found");
      }
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID }
      });
      await this.prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: ApplicationStatus.ACCEPTED }
      });
    }
    return result;
  }
}
