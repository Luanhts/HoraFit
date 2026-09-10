import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredApiKey = process.env.ADMIN_API_KEY;

    if (!configuredApiKey) {
      throw new UnauthorizedException(
        'Credencial administrativa não configurada.',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.header('x-admin-api-key');

    if (apiKey !== configuredApiKey) {
      throw new UnauthorizedException('Credencial administrativa inválida.');
    }

    return true;
  }
}
