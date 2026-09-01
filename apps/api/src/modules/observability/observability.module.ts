import { Global, Module } from "@nestjs/common";
import { StructuredLoggerService } from "./logger.service.js";
import { MetricsService } from "./metrics.service.js";
import { RequestLoggerInterceptor } from "./request-logger.interceptor.js";

@Global()
@Module({
  providers: [
    StructuredLoggerService,
    MetricsService,
    RequestLoggerInterceptor
  ],
  exports: [
    StructuredLoggerService,
    MetricsService,
    RequestLoggerInterceptor
  ]
})
export class ObservabilityModule {}
