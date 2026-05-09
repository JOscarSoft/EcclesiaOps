import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export const TENANT_ID_HEADER = 'x-tenant-id';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers[TENANT_ID_HEADER];
    if (!tenantId) {
      console.warn(`[TenantMiddleware] Petición a ${req.url} sin header ${TENANT_ID_HEADER}`);
      throw new BadRequestException(`El header ${TENANT_ID_HEADER} es obligatorio para las rutas de tenant.`);
    }
    // Inject the tenant id into the request object
    (req as any).tenantId = tenantId.toString();
    next();
  }
}
