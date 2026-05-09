import { InternalServerErrorException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as mongoose from 'mongoose';
import { Request } from 'express';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

// In-memory cache to store active Mongoose connections per tenant
const connectionsMap = new Map<string, mongoose.Connection>();

export const tenantConnectionProvider = {
  provide: TENANT_CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (request: Request) => {
    const tenantId = (request as any).tenantId;

    if (!tenantId) {
      throw new InternalServerErrorException('No se proporcionó un tenant ID en el contexto.');
    }

    if (connectionsMap.has(tenantId)) {
      return connectionsMap.get(tenantId);
    }

    // Default URI format usually looks like: mongodb://localhost:27017/platform_db
    const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/platform_db';

    // We construct the tenant specific URI by parsing the URL
    // Mongoose URIs don't strictly follow standard URL schema if they contain replica sets,
    // but for local testing `new URL()` works. A safer way is regex replacement of the DB name.

    // Simple string replacement for DB name
    const uriParts = baseUri.split('/');
    const lastPart = uriParts.pop(); // platform_db
    // Check if it has query parameters
    const queryParams = lastPart?.includes('?') ? '?' + lastPart.split('?')[1] : '';

    const newDbName = `tenant_${tenantId}${queryParams}`;
    const tenantUri = [...uriParts, newDbName].join('/');

    if (connectionsMap.has(tenantId)) {
      return connectionsMap.get(tenantId);
    }

    const connection = mongoose.createConnection(tenantUri);
    connectionsMap.set(tenantId, connection);

    return connection;
  },
  inject: [REQUEST],
};
