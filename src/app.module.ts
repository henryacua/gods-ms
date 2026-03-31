import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './infrastructure/controllers/health.controller';
import { HealthService } from './core/services/health.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { HealthResolver } from './infrastructure/resolvers/health.resolver';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from './modules/organization/organization.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StoreModule } from './modules/store/store.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      logging: true,
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),

    UserModule,
    OrganizationModule,
    StoreModule,
    NotificationModule,
    AppointmentModule,
  ],
  controllers: [HealthController],
  providers: [HealthService, HealthResolver],
})
export class AppModule {}
