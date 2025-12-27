import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {
  ApplicationsModule,
  AuthModule,
  ContentModule,
  ListingsModule,
  MessagingModule,
  PaymentsModule,
  ProfilesModule,
  ReviewsModule,
  SearchModule
} from "./modules";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
  }),
  PrismaModule,
  AuthModule,
  ProfilesModule,
  ListingsModule,
  ApplicationsModule,
    MessagingModule,
    ReviewsModule,
    PaymentsModule,
    ContentModule,
    SearchModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService]
})
export class AppModule {}
