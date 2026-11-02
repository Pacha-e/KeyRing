// --- External imports ---
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

// --- Internal imports ---
import { ContractsService } from './contracts.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';
import { Contract } from './entities/contract.entity.js';

// --- Exported members ---
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto): Promise<Contract> {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  findAll(@Query('propertyIds') propertyIds?: string): Promise<Contract[]> {
    if (propertyIds === undefined) return this.contractsService.findAll();
    return this.contractsService.findVisible(propertyIds.split(',').filter(Boolean));
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Contract> {
    return this.contractsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.contractsService.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdateContractDto,
  ): Promise<Contract> {
    return this.contractsService.update(id, changes);
  }
}
