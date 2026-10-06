import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ContractsService } from './contracts.service.js'
import { Contract } from './entities/contract.entity.js'
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto.js'

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * GET /api/contracts?propertyIds=a,b — contratos de las propiedades visibles.
   * Sin query devuelve todos (reportes del administrador).
   */
  @Get()
  findAll(@Query('propertyIds') propertyIds?: string): Promise<Contract[]> {
    if (propertyIds === undefined) return this.contractsService.findAll()
    return this.contractsService.findVisible(propertyIds.split(',').filter(Boolean))
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract> {
    return this.contractsService.findOne(id)
  }

  @Post()
  create(@Body() createContractDto: CreateContractDto): Promise<Contract> {
    return this.contractsService.create(createContractDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() changes: UpdateContractDto): Promise<Contract> {
    return this.contractsService.update(id, changes)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.contractsService.remove(id)
  }
}
