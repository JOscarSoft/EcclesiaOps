import { Connection, Schema } from 'mongoose';
import { TENANT_CONNECTION } from './tenant-connection.provider';

/**
 * Creates a dynamic provider that injects the Mongoose Model bound to the 
 * tenant-specific connection instead of the global Mongoose connection.
 */
export function createTenantModelProvider(modelName: string, schema: Schema) {
  return {
    provide: `${modelName}Model`,
    useFactory: (connection: Connection) => {
      // Return the model from the connection, compiling it if necessary
      return connection.model(modelName, schema);
    },
    inject: [TENANT_CONNECTION],
  };
}
