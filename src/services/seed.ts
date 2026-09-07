import { getAll, create, update, KEYS } from './storage'
import {
  UserRole,
  PropertyType,
  RentalMode,
  PropertyStatus,
  ContractStatus,
  TransactionType,
  TransactionSource,
} from '../interfaces/enums'
import type { UserInterface } from '../interfaces/UserInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'

const SEED_FLAG = 'keyring_seeded'

// Fecha ISO hace N días (para que los datos siempre se vean "recientes")
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Crea datos ficticios la primera vez que se abre la app (bandera keyring_seeded)
export function seedDatabase(): void {
  if (localStorage.getItem(SEED_FLAG)) return

  // --- Usuarios ---
  const admin = create<UserInterface>(KEYS.users, {
    fullName: 'Admin KeyRing',
    email: 'admin@keyring.co',
    password: 'admin123',
    phone: '3001112233',
    city: 'Medellín',
    memberSince: daysAgo(400),
    role: UserRole.ADMIN,
    properties: [],
  })
  const user = create<UserInterface>(KEYS.users, {
    fullName: 'Usuario Demo',
    email: 'user@keyring.co',
    password: 'user123',
    phone: '3004445566',
    city: 'Bogotá',
    memberSince: daysAgo(200),
    role: UserRole.USER,
    properties: [],
  })

  // --- Propiedades (2 por ciudad) ---
  const propsData: CreatePropertyDTO[] = [
    {
      name: 'Apartamento El Poblado',
      address: 'Cra 43A #10-25',
      city: 'Medellín',
      type: PropertyType.APARTMENT,
      rentalMode: RentalMode.AIRBNB,
      status: PropertyStatus.ACTIVE,
      estimatedMonthlyRent: 3200000,
      adminFee: 320000,
      otherFixedCosts: 250000,
      ownerId: null,
    },
    {
      name: 'Casa Laureles',
      address: 'Cll 33 #78-40',
      city: 'Medellín',
      type: PropertyType.HOUSE,
      rentalMode: RentalMode.BOTH,
      status: PropertyStatus.ACTIVE,
      estimatedMonthlyRent: 4500000,
      adminFee: 450000,
      otherFixedCosts: 380000,
      ownerId: null,
    },
    {
      name: 'Apartamento Chapinero',
      address: 'Cll 53 #13-20',
      city: 'Bogotá',
      type: PropertyType.APARTMENT,
      rentalMode: RentalMode.FIXED_CONTRACT,
      status: PropertyStatus.ACTIVE,
      estimatedMonthlyRent: 2800000,
      adminFee: 280000,
      otherFixedCosts: 300000,
      ownerId: null,
    },
    {
      name: 'Casa Usaquén',
      address: 'Cll 119 #5-30',
      city: 'Bogotá',
      type: PropertyType.HOUSE,
      rentalMode: RentalMode.BOTH,
      status: PropertyStatus.VACANT,
      estimatedMonthlyRent: 5200000,
      adminFee: 520000,
      otherFixedCosts: 420000,
      ownerId: null,
    },
    {
      name: 'Apartamento San Antonio',
      address: 'Cra 5 #3-15',
      city: 'Cali',
      type: PropertyType.APARTMENT,
      rentalMode: RentalMode.AIRBNB,
      status: PropertyStatus.ACTIVE,
      estimatedMonthlyRent: 2100000,
      adminFee: 210000,
      otherFixedCosts: 180000,
      ownerId: null,
    },
    {
      name: 'Finca La Loma',
      address: 'Vereda La Loma km 4',
      city: 'Cali',
      type: PropertyType.FARM,
      rentalMode: RentalMode.FIXED_CONTRACT,
      status: PropertyStatus.ACTIVE,
      estimatedMonthlyRent: 6000000,
      adminFee: 600000,
      otherFixedCosts: 500000,
      ownerId: null,
    },
  ]
  // El usuario demo es dueño de las propiedades de Cali; el admin, del resto
  const properties: PropertyInterface[] = propsData.map((p) =>
    create<PropertyInterface>(KEYS.properties, {
      ...p,
      ownerId: p.city === 'Cali' ? user.id : admin.id,
    }),
  )
  // Referencia de propiedades en cada usuario (persistida en LocalStorage)
  update<UserInterface>(KEYS.users, admin.id, {
    properties: properties.filter((p) => p.ownerId === admin.id).map((p) => p.id),
  })
  update<UserInterface>(KEYS.users, user.id, {
    properties: properties.filter((p) => p.ownerId === user.id).map((p) => p.id),
  })

  // --- Contratos ---
  const contractsData: CreateContractDTO[] = [
    {
      propertyId: properties[1].id,
      fixedRent: 4200000,
      startDate: daysAgo(150),
      endDate: daysAgo(-215),
      tenantName: 'Carlos Ríos',
      tenantContact: '3105551234',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[2].id,
      fixedRent: 2600000,
      startDate: daysAgo(90),
      endDate: daysAgo(-275),
      tenantName: 'María Gómez',
      tenantContact: '3116662345',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[5].id,
      fixedRent: 5800000,
      startDate: daysAgo(300),
      endDate: daysAgo(-65),
      tenantName: 'Finca Eventos SAS',
      tenantContact: '6027778899',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[3].id,
      fixedRent: 5000000,
      startDate: daysAgo(500),
      endDate: daysAgo(135),
      tenantName: 'Pedro Sandoval',
      tenantContact: '3158889900',
      status: ContractStatus.EXPIRED,
    },
  ]
  contractsData.forEach((c) => create<ContractInterface>(KEYS.contracts, c))

  // --- Transacciones (últimos ~3 meses) ---
  const T = TransactionType
  const S = TransactionSource
  const txData: CreateTransactionDTO[] = [
    {
      propertyId: properties[0].id,
      type: T.INCOME,
      source: S.AIRBNB,
      amount: 950000,
      date: daysAgo(5),
      description: 'Reserva Airbnb 3 noches',
    },
    {
      propertyId: properties[0].id,
      type: T.INCOME,
      source: S.AIRBNB,
      amount: 1200000,
      date: daysAgo(20),
      description: 'Reserva Airbnb 4 noches',
    },
    {
      propertyId: properties[0].id,
      type: T.EXPENSE,
      source: S.OTHER,
      amount: 180000,
      date: daysAgo(22),
      description: 'Aseo y lavandería',
    },
    {
      propertyId: properties[1].id,
      type: T.INCOME,
      source: S.CONTRACT,
      amount: 4200000,
      date: daysAgo(3),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[1].id,
      type: T.EXPENSE,
      source: S.OTHER,
      amount: 450000,
      date: daysAgo(10),
      description: 'Administración y servicios',
    },
    {
      propertyId: properties[2].id,
      type: T.INCOME,
      source: S.CONTRACT,
      amount: 2600000,
      date: daysAgo(7),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[2].id,
      type: T.INCOME,
      source: S.CONTRACT,
      amount: 2600000,
      date: daysAgo(37),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[4].id,
      type: T.INCOME,
      source: S.AIRBNB,
      amount: 700000,
      date: daysAgo(12),
      description: 'Reserva Airbnb 2 noches',
    },
    {
      propertyId: properties[4].id,
      type: T.INCOME,
      source: S.AIRBNB,
      amount: 1050000,
      date: daysAgo(45),
      description: 'Reserva Airbnb 3 noches',
    },
    {
      propertyId: properties[5].id,
      type: T.INCOME,
      source: S.CONTRACT,
      amount: 5800000,
      date: daysAgo(2),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[5].id,
      type: T.EXPENSE,
      source: S.OTHER,
      amount: 600000,
      date: daysAgo(15),
      description: 'Mantenimiento de zonas verdes',
    },
    {
      propertyId: properties[1].id,
      type: T.EXPENSE,
      source: S.OTHER,
      amount: 320000,
      date: daysAgo(60),
      description: 'Reparación plomería',
    },
    {
      propertyId: properties[0].id,
      type: T.INCOME,
      source: S.AIRBNB,
      amount: 880000,
      date: daysAgo(70),
      description: 'Reserva Airbnb 3 noches',
    },
  ]
  txData.forEach((t) => create<TransactionInterface>(KEYS.transactions, t))

  localStorage.setItem(SEED_FLAG, '1')
}

// Utilidad para desarrollo: borra todo y vuelve a sembrar
export function resetDatabase(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem(SEED_FLAG)
  seedDatabase()
}

// Re-export para comodidad de las vistas
export { getAll, KEYS }
