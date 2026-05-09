import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CouncilsModule } from './modules/platform/councils/councils.module';
import { ChurchesModule } from './modules/tenant/churches/churches.module';
import { UsersModule } from './modules/tenant/users/users.module';
import { RolesModule } from './modules/tenant/roles/roles.module';
import { MembersModule } from './modules/tenant/members/members.module';
import { FinanceModule } from './modules/tenant/finance/finance.module';
import { ActivitiesModule } from './modules/tenant/activities/activities.module';
import { StatsModule } from './modules/tenant/stats/stats.module';
import { TenantMiddleware } from './modules/tenants/tenant.middleware';
import { PlatformUsersModule } from './modules/platform/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/platform_db',
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    AuthModule,
    CouncilsModule,
    ChurchesModule,
    UsersModule,
    RolesModule,
    MembersModule,
    FinanceModule,
    ActivitiesModule,
    StatsModule,
    PlatformUsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('tenant/*'); // Apply to all tenant routes so they get the db connection
  }
}
