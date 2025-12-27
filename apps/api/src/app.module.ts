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
  ReviewsModule
} from "./modules";
import { PrismaModule } from "./prisma/prisma.module";

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
  ContentModule
],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
