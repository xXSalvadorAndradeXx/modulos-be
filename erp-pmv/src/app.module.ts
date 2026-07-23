import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    // ── Configuración de variables de entorno ──────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env'],
    }),

    // ── Base de datos ─────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        ...(configService.get<TypeOrmModuleOptions>('database') as TypeOrmModuleOptions),
      }),
    }),

    // ── Rate limiting ─────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto en ms
        limit: 60,
      },
    ]),

    // ── Módulos funcionales (se importarán paso a paso) ───────────────
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