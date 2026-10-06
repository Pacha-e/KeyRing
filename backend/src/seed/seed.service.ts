import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity.js'
import { Property } from '../properties/entities/property.entity.js'
import { Contract } from '../contracts/entities/contract.entity.js'
import { Transaction } from '../transactions/entities/transaction.entity.js'

/**
 * Siembra la base de datos la primera vez que arranca la API, con los mismos
 * datos ficticios que traía la SPA: así la navegación inicial del evaluador
 * tiene contenido desde el primer request.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(Contract) private readonly contractsRepository: Repository<Contract>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async onModuleInit(): Promise<void> {
    if ((await this.usersRepository.count()) > 0) return

    const admin = await this.usersRepository.save(
      this.usersRepository.create({
        fullName: 'Admin KeyRing',
        email: 'admin@keyring.co',
        password: 'admin123',
        phone: '3001112233',
        city: 'Medellín',
        memberSince: this.isoDaysAgo(400),
        role: 'admin',
      }),
    )
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        fullName: 'Usuario Demo',
        email: 'user@keyring.co',
        password: 'user123',
        phone: '3004445566',
        city: 'Bogotá',
        memberSince: this.isoDaysAgo(200),
        role: 'user',
      }),
    )

    const propertyDrafts = [
      {
        name: 'Apartamento El Poblado',
        address: 'Cra 43A #10-25',
        city: 'Medellín',
        type: 'APARTMENT' as const,
        rentalMode: 'AIRBNB' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 3200000,
        adminFee: 320000,
        otherFixedCosts: 250000,
        latitude: 6.2086,
        longitude: -75.5676,
      },
      {
        name: 'Casa Laureles',
        address: 'Cll 33 #78-40',
        city: 'Medellín',
        type: 'HOUSE' as const,
        rentalMode: 'BOTH' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 4500000,
        adminFee: 450000,
        otherFixedCosts: 380000,
        latitude: 6.2447,
        longitude: -75.5963,
      },
      {
        name: 'Apartamento Chapinero',
        address: 'Cll 53 #13-20',
        city: 'Bogotá',
        type: 'APARTMENT' as const,
        rentalMode: 'FIXED_CONTRACT' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 2800000,
        adminFee: 280000,
        otherFixedCosts: 300000,
        latitude: 4.6418,
        longitude: -74.0645,
      },
      {
        name: 'Casa Usaquén',
        address: 'Cll 119 #5-30',
        city: 'Bogotá',
        type: 'HOUSE' as const,
        rentalMode: 'BOTH' as const,
        status: 'VACANT' as const,
        estimatedMonthlyRent: 5200000,
        adminFee: 520000,
        otherFixedCosts: 420000,
        latitude: 4.6959,
        longitude: -74.0305,
      },
      {
        name: 'Apartamento San Antonio',
        address: 'Cra 5 #3-15',
        city: 'Cali',
        type: 'APARTMENT' as const,
        rentalMode: 'AIRBNB' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 2100000,
        adminFee: 210000,
        otherFixedCosts: 180000,
        latitude: 3.4455,
        longitude: -76.5412,
      },
      {
        name: 'Finca La Loma',
        address: 'Vereda La Loma km 4',
        city: 'Cali',
        type: 'FARM' as const,
        rentalMode: 'FIXED_CONTRACT' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 6000000,
        adminFee: 600000,
        otherFixedCosts: 500000,
        latitude: 3.4181,
        longitude: -76.5851,
      },
    ]

    // El usuario demo es dueño de las propiedades de Cali; el admin, del resto.
    const properties = await Promise.all(
      propertyDrafts.map((draft) =>
        this.propertiesRepository.save(
          this.propertiesRepository.create({
            ...draft,
            ownerId: draft.city === 'Cali' ? user.id : admin.id,
          }),
        ),
      ),
    )

    const contracts = [
      {
        property: properties[1],
        fixedRent: 4200000,
        startDate: this.isoDaysAgo(150),
        endDate: this.isoDaysAgo(-215),
        tenantName: 'Carlos Ríos',
        tenantContact: '3105551234',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[2],
        fixedRent: 2600000,
        startDate: this.isoDaysAgo(90),
        endDate: this.isoDaysAgo(-275),
        tenantName: 'María Gómez',
        tenantContact: '3116662345',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[5],
        fixedRent: 5800000,
        startDate: this.isoDaysAgo(300),
        endDate: this.isoDaysAgo(-65),
        tenantName: 'Finca Eventos SAS',
        tenantContact: '6027778899',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[3],
        fixedRent: 5000000,
        startDate: this.isoDaysAgo(500),
        endDate: this.isoDaysAgo(135),
        tenantName: 'Pedro Sandoval',
        tenantContact: '3158889900',
        status: 'EXPIRED' as const,
      },
    ]
    await Promise.all(
      contracts.map((draft) => this.contractsRepository.save(this.contractsRepository.create(draft))),
    )

    const transactions = [
      { property: properties[0], type: 'INCOME' as const, source: 'AIRBNB' as const, amount: 950000, date: this.isoDaysAgo(5), description: 'Reserva Airbnb 3 noches' },
      { property: properties[0], type: 'INCOME' as const, source: 'AIRBNB' as const, amount: 1200000, date: this.isoDaysAgo(20), description: 'Reserva Airbnb 4 noches' },
      { property: properties[0], type: 'EXPENSE' as const, source: 'OTHER' as const, amount: 180000, date: this.isoDaysAgo(22), description: 'Aseo y lavandería' },
      { property: properties[1], type: 'INCOME' as const, source: 'CONTRACT' as const, amount: 4200000, date: this.isoDaysAgo(3), description: 'Canon de arriendo mensual' },
      { property: properties[1], type: 'EXPENSE' as const, source: 'OTHER' as const, amount: 450000, date: this.isoDaysAgo(10), description: 'Administración y servicios' },
      { property: properties[2], type: 'INCOME' as const, source: 'CONTRACT' as const, amount: 2600000, date: this.isoDaysAgo(7), description: 'Canon de arriendo mensual' },
      { property: properties[2], type: 'INCOME' as const, source: 'CONTRACT' as const, amount: 2600000, date: this.isoDaysAgo(37), description: 'Canon de arriendo mensual' },
      { property: properties[4], type: 'INCOME' as const, source: 'AIRBNB' as const, amount: 700000, date: this.isoDaysAgo(12), description: 'Reserva Airbnb 2 noches' },
      { property: properties[4], type: 'INCOME' as const, source: 'AIRBNB' as const, amount: 1050000, date: this.isoDaysAgo(45), description: 'Reserva Airbnb 3 noches' },
      { property: properties[5], type: 'INCOME' as const, source: 'CONTRACT' as const, amount: 5800000, date: this.isoDaysAgo(2), description: 'Canon de arriendo mensual' },
      { property: properties[5], type: 'EXPENSE' as const, source: 'OTHER' as const, amount: 600000, date: this.isoDaysAgo(15), description: 'Mantenimiento de zonas verdes' },
      { property: properties[1], type: 'EXPENSE' as const, source: 'OTHER' as const, amount: 320000, date: this.isoDaysAgo(60), description: 'Reparación plomería' },
      { property: properties[0], type: 'INCOME' as const, source: 'AIRBNB' as const, amount: 880000, date: this.isoDaysAgo(70), description: 'Reserva Airbnb 3 noches' },
    ]
    await Promise.all(
      transactions.map((draft) =>
        this.transactionsRepository.save(this.transactionsRepository.create(draft)),
      ),
    )
  }

  /** Fecha ISO 'YYYY-MM-DD' de hace N días (negativo para fechas futuras). */
  private isoDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().slice(0, 10)
  }
}
