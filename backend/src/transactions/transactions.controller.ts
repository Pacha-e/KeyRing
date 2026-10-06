import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { TransactionsService } from './transactions.service.js'
import { Transaction } from './entities/transaction.entity.js'
import { CreateTransactionDto, UpdateTransactionDto } from './dto/create-transaction.dto.js'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * GET /api/transactions?propertyIds=a,b — movimientos de las propiedades
   * visibles. Sin query devuelve todos (reportes del administrador).
   */
  @Get()
  findAll(@Query('propertyIds') propertyIds?: string): Promise<Transaction[]> {
    if (propertyIds === undefined) return this.transactionsService.findAll()
    return this.transactionsService.findVisible(propertyIds.split(',').filter(Boolean))
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionsService.findOne(id)
  }

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() changes: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, changes)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.transactionsService.remove(id)
  }
}
