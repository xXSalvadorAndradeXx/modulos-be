import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import throttlerConfig from './config/throttler.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    // ── Configuración de variables de entorno ──────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, throttlerConfig],
      envFilePath: ['.env'],
    }),

    // ── Base de datos ─────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions,
    }),

    // ── Rate limiting ─────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttl') as number,
          limit: configService.get<number>('throttler.limit') as number,
        },
      ],
    }),

    // ── Módulos funcionales (se activarán paso a paso) ─────────────────
    // AuthModule,
    // UsersModule,
    // RolesModule,
    // PermissionsModule,
    // SuppliersModule,
    // PurchasesModule,
    // ProductsModule,
    // ProductCategoriesModule,
    // InventoryModule,
    // CustomersModule,
  ],
})
export class AppModule {}

