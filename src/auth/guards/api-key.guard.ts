import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader) {
      throw new HttpException('API Key is missing', HttpStatus.UNAUTHORIZED);
    }

    const validApiKeys = this.configService.get<string>('API_KEYS').split(",");
    if (!validApiKeys.includes(apiKeyHeader)) {
      throw new HttpException('Invalid API Key', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
