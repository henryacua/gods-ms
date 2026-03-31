import { Module } from '@nestjs/common';
import { StoreResolver } from './infrastructure/resolvers/store.resolver';
import { StoreService } from './core/services/store.service';
import { StoreRepository } from './infrastructure/repositories/store.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './core/entities/store.entity';

const services = [StoreService, StoreResolver];

const interfaces = [{ provide: 'IStoreRepository', useClass: StoreRepository }];

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [],
  providers: [...services, ...interfaces],
  exports: [StoreService],
})
export class StoreModule {}
