// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { Property } from './entities/property.entity.js';
import { PropertiesController } from './properties.controller.js';
import { PropertiesService } from './properties.service.js';

// --- Exported members ---
@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
