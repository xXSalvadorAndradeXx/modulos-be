import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import throttlerConfig from './config/throttler.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, throttlerConfig],
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions,
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttl') as number,
          limit: configService.get<number>('throttler.limit') as number,
        },
      ],
    }),

    PermissionsModule,
    // AuthModule,
    // UsersModule,
    // RolesModule,
    // SuppliersModule,
    // PurchasesModule,
    // ProductsModule,
    // ProductCategoriesModule,
    // InventoryModule,
    // CustomersModule,
  ],
})
export class AppModule {}