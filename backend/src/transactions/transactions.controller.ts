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
  Req,
} from '@nestjs/common';

// --- Internal imports ---
import { AuthService } from '../auth/auth.service.js';
import type { AuthRequest } from '../auth/auth.service.js';
import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';

// --- Exported members ---
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @Req() request: AuthRequest,
  ): Promise<Transaction> {
    await this.auth.property(request.user!, dto.propertyId);
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Req() request: AuthRequest,
    @Query('propertyIds') propertyIds?: string,
  ): Promise<Transaction[]> {
    let ids = await this.auth.visibleIds(request.user!);
    if (propertyIds !== undefined) {
      const requested = new Set(propertyIds.split(',').filter(Boolean));
      ids = ids.filter((id) => requested.has(id));
    }
    return this.service.findVisible(ids);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthRequest,
  ): Promise<Transaction> {
    const item = await this.service.findOne(id);
    await this.auth.property(request.user!, item.propertyId);
    return item;
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthRequest): Promise<void> {
    const item = await this.service.findOne(id);
    await this.auth.property(request.user!, item.propertyId);
    await this.service.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdateTransactionDto,
    @Req() request: AuthRequest,
  ): Promise<Transaction> {
    const item = await this.service.findOne(id);
    await this.auth.property(request.user!, item.propertyId);
    if (changes.propertyId !== undefined)
      await this.auth.property(request.user!, changes.propertyId);
    return this.service.update(id, changes);
  }
}
