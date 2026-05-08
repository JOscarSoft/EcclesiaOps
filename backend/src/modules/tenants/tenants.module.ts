import { Global, Module } from '@nestjs/common';
import { tenantConnectionProvider } from './tenant-connection.provider';

@Global()
@Module({
  providers: [tenantConnectionProvider],
  exports: [tenantConnectionProvider],
})
export class TenantsModule {}
