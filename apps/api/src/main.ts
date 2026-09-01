import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./modules/app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"]
  });

  const config = new DocumentBuilder()
    .setTitle("VC-WMS API")
    .setDescription("Multi-tenant workforce management SaaS foundation API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("api/v1/docs", app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

void bootstrap();

