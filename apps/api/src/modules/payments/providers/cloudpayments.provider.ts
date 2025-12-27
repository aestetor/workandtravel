import crypto from "crypto";

import { PaymentStatus } from "@prisma/client";

import {
  PaymentIntent,
  PaymentIntentInput,
  PaymentProvider,
  PaymentWebhookResult
} from "../payment.provider";

type CloudPaymentsConfig = {
  publicId: string;
  secret: string;
};

export class CloudPaymentsProvider implements PaymentProvider {
  constructor(private readonly config: CloudPaymentsConfig) {}

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntent> {
    // TODO: Подключить CloudPayments API (charge/token) и сохранять транзакцию в БД.
    const mockExternalId = `cp_${input.applicationId}`;
    const paymentUrl = `https://payments.cloudpayments.ru/pay?publicId=${this.config.publicId}&amount=${input.amountKzt}`;

    return {
      externalId: mockExternalId,
      status: PaymentStatus.INITIATED,
      paymentUrl
    };
  }

  async handleWebhook(payload: unknown, signature: string | undefined): Promise<PaymentWebhookResult> {
    // TODO: Реальная валидация подписи: compare HMAC с secret.
    if (!signature) {
      throw new Error("Missing CloudPayments signature");
    }

    if (!this.isValidSignature(payload, signature)) {
      throw new Error("Invalid CloudPayments signature");
    }

    // В реальной интеграции нужно распарсить payload и статус транзакции.
    const body = (payload as Record<string, unknown>) ?? {};
    const transactionId =
      (body["TransactionId"] as string) ||
      (body["transactionId"] as string) ||
      (body["cpTransactionId"] as string) ||
      (body["ExternalId"] as string) ||
      "cp_tx_mock";
    const applicationId =
      (body["ApplicationId"] as string) || (body["applicationId"] as string) || undefined;

    return {
      transactionId,
      status: PaymentStatus.PAID,
      applicationId
    };
  }

  private isValidSignature(payload: unknown, signature: string) {
    const body = JSON.stringify(payload ?? {});
    const hmac = crypto.createHmac("sha256", this.config.secret).update(body).digest("hex");
    return hmac === signature;
  }
}
