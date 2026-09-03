import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let code: string | undefined = undefined;

    const isProduction = process.env.NODE_ENV === "production";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        code = (resObj.code as string) || (resObj.error as string);
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join("; ");
        }
      } else {
        message = exception.message;
      }
    } else if (this.isPrismaError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      const prismaError = exception as { code?: string; message?: string };
      code = prismaError.code || "DATABASE_ERROR";
      if (isProduction) {
        // Redact internal Prisma details, table names, queries
        if (prismaError.code === "P2002") {
          message = "A record with this unique identifier already exists.";
        } else if (prismaError.code === "P2025") {
          status = HttpStatus.NOT_FOUND;
          message = "Requested record was not found.";
        } else {
          message = "Database operation failed. Please verify input parameters.";
        }
      } else {
        message = prismaError.message || "Database query failed";
      }
    } else if (exception instanceof Error) {
      if (!isProduction) {
        message = exception.message;
      } else {
        message = "An unexpected error occurred. Please contact support if the problem persists.";
      }
    }

    // Log the error securely server-side
    const url = request?.originalUrl || request?.url || "unknown";
    const method = request?.method || "unknown";

    if (status >= 500) {
      this.logger.error(
        `[${method}] ${url} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined
      );
    } else {
      this.logger.warn(`[${method}] ${url} -> ${status}: ${message}`);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      message,
      ...(code ? { code } : {})
    });
  }

  private isPrismaError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;
    const name = (error as { name?: string }).name;
    return typeof name === "string" && name.startsWith("PrismaClient");
  }
}
