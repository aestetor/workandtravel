import { PaymentStatus } from "@prisma/client";

export type PaymentIntentInput = {
  applicationId: string;
  amountKzt: number;
  description?: string;
  userId: string;
};

export type PaymentIntent = {
  externalId: string;
  status: PaymentStatus;
  paymentUrl: string;
};

export type PaymentWebhookResult = {
  transactionId: string;
  status: PaymentStatus;
  applicationId?: string;
};

export interface PaymentProvider {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntent>;
  handleWebhook(payload: unknown, signature: string | undefined): Promise<PaymentWebhookResult>;
}
