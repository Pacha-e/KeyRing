import * as storage from './storage'
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

// La bandera lleva versión: al cambiar los datos sembrados (por ejemplo al
// añadirles coordenadas) hay que resembrar los navegadores que ya tenían la
// versión anterior guardada, o seguirían viendo los datos viejos para siempre.
const SEED_FLAG = 'keyring_seeded_v2'

// Fecha ISO hace N días (para que los datos siempre se vean "recientes")
function isoDateDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Crea datos ficticios la primera vez que se abre la app (bandera SEED_FLAG)
export function seedDatabase(): void {
  if (localStorage.getItem(SEED_FLAG)) return

  // Se parte de cero antes de sembrar. La siembra usa insert, que añade al
  // final de la colección: si quedaban datos de una versión anterior de la
  // semilla, los nuevos se sumarían a ellos y todo aparecería por duplicado.
  Object.values(storage.STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))

  // --- Usuarios ---
  const admin = storage.insert<UserInterface>(storage.STORAGE_KEYS.users, {
    fullName: 'Admin KeyRing',
    email: 'admin@keyring.co',
    password: 'admin123',
    phone: '3001112233',
    city: 'Medellín',
    memberSince: isoDateDaysAgo(400),
    role: UserRole.ADMIN,
    properties: [],
  })
  const user = storage.insert<UserInterface>(storage.STORAGE_KEYS.users, {
    fullName: 'Usuario Demo',
    email: 'user@keyring.co',
    password: 'user123',
    phone: '3004445566',
    city: 'Bogotá',
    memberSince: isoDateDaysAgo(200),
    role: UserRole.USER,
    properties: [],
  })

  // --- Propiedades (2 por ciudad) ---
  // Las coordenadas son las del barrio de cada inmueble, no las del centro de
  // la ciudad: “Apartamento El Poblado” tiene que caer en El Poblado.
  const propertiesToSeed: CreatePropertyDTO[] = [
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
      latitude: 6.2086,
      longitude: -75.5676,
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
      latitude: 6.2447,
      longitude: -75.5963,
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
      latitude: 4.6418,
      longitude: -74.0645,
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
      latitude: 4.6959,
      longitude: -74.0305,
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
      latitude: 3.4455,
      longitude: -76.5412,
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
      latitude: 3.4181,
      longitude: -76.5851,
    },
  ]
  // El usuario demo es dueño de las propiedades de Cali; el admin, del resto
  const properties: PropertyInterface[] = propertiesToSeed.map((p) =>
    storage.insert<PropertyInterface>(storage.STORAGE_KEYS.properties, {
      ...p,
      ownerId: p.city === 'Cali' ? user.id : admin.id,
    }),
  )
  // Referencia de propiedades en cada usuario (persistida en LocalStorage)
  storage.applyChanges<UserInterface>(storage.STORAGE_KEYS.users, admin.id, {
    properties: properties.filter((p) => p.ownerId === admin.id).map((p) => p.id),
  })
  storage.applyChanges<UserInterface>(storage.STORAGE_KEYS.users, user.id, {
    properties: properties.filter((p) => p.ownerId === user.id).map((p) => p.id),
  })

  // --- Contratos ---
  const contractsToSeed: CreateContractDTO[] = [
    {
      propertyId: properties[1].id,
      fixedRent: 4200000,
      startDate: isoDateDaysAgo(150),
      endDate: isoDateDaysAgo(-215),
      tenantName: 'Carlos Ríos',
      tenantContact: '3105551234',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[2].id,
      fixedRent: 2600000,
      startDate: isoDateDaysAgo(90),
      endDate: isoDateDaysAgo(-275),
      tenantName: 'María Gómez',
      tenantContact: '3116662345',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[5].id,
      fixedRent: 5800000,
      startDate: isoDateDaysAgo(300),
      endDate: isoDateDaysAgo(-65),
      tenantName: 'Finca Eventos SAS',
      tenantContact: '6027778899',
      status: ContractStatus.ACTIVE,
    },
    {
      propertyId: properties[3].id,
      fixedRent: 5000000,
      startDate: isoDateDaysAgo(500),
      endDate: isoDateDaysAgo(135),
      tenantName: 'Pedro Sandoval',
      tenantContact: '3158889900',
      status: ContractStatus.EXPIRED,
    },
  ]
  contractsToSeed.forEach((c) =>
    storage.insert<ContractInterface>(storage.STORAGE_KEYS.contracts, c),
  )

  // --- Transacciones (últimos ~3 meses) ---
  const Type = TransactionType
  const Source = TransactionSource
  const transactionsToSeed: CreateTransactionDTO[] = [
    {
      propertyId: properties[0].id,
      type: Type.INCOME,
      source: Source.AIRBNB,
      amount: 950000,
      date: isoDateDaysAgo(5),
      description: 'Reserva Airbnb 3 noches',
    },
    {
      propertyId: properties[0].id,
      type: Type.INCOME,
      source: Source.AIRBNB,
      amount: 1200000,
      date: isoDateDaysAgo(20),
      description: 'Reserva Airbnb 4 noches',
    },
    {
      propertyId: properties[0].id,
      type: Type.EXPENSE,
      source: Source.OTHER,
      amount: 180000,
      date: isoDateDaysAgo(22),
      description: 'Aseo y lavandería',
    },
    {
      propertyId: properties[1].id,
      type: Type.INCOME,
      source: Source.CONTRACT,
      amount: 4200000,
      date: isoDateDaysAgo(3),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[1].id,
      type: Type.EXPENSE,
      source: Source.OTHER,
      amount: 450000,
      date: isoDateDaysAgo(10),
      description: 'Administración y servicios',
    },
    {
      propertyId: properties[2].id,
      type: Type.INCOME,
      source: Source.CONTRACT,
      amount: 2600000,
      date: isoDateDaysAgo(7),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[2].id,
      type: Type.INCOME,
      source: Source.CONTRACT,
      amount: 2600000,
      date: isoDateDaysAgo(37),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[4].id,
      type: Type.INCOME,
      source: Source.AIRBNB,
      amount: 700000,
      date: isoDateDaysAgo(12),
      description: 'Reserva Airbnb 2 noches',
    },
    {
      propertyId: properties[4].id,
      type: Type.INCOME,
      source: Source.AIRBNB,
      amount: 1050000,
      date: isoDateDaysAgo(45),
      description: 'Reserva Airbnb 3 noches',
    },
    {
      propertyId: properties[5].id,
      type: Type.INCOME,
      source: Source.CONTRACT,
      amount: 5800000,
      date: isoDateDaysAgo(2),
      description: 'Canon de arriendo mensual',
    },
    {
      propertyId: properties[5].id,
      type: Type.EXPENSE,
      source: Source.OTHER,
      amount: 600000,
      date: isoDateDaysAgo(15),
      description: 'Mantenimiento de zonas verdes',
    },
    {
      propertyId: properties[1].id,
      type: Type.EXPENSE,
      source: Source.OTHER,
      amount: 320000,
      date: isoDateDaysAgo(60),
      description: 'Reparación plomería',
    },
    {
      propertyId: properties[0].id,
      type: Type.INCOME,
      source: Source.AIRBNB,
      amount: 880000,
      date: isoDateDaysAgo(70),
      description: 'Reserva Airbnb 3 noches',
    },
  ]
  transactionsToSeed.forEach((t) =>
    storage.insert<TransactionInterface>(storage.STORAGE_KEYS.transactions, t),
  )

  localStorage.setItem(SEED_FLAG, '1')
}

/**
 * Utilidad de desarrollo: vuelve a dejar la base como recién instalada.
 * Se invoca desde la consola del navegador cuando se quiere partir de cero.
 * El borrado de las colecciones lo hace ya seedDatabase.
 */
export function resetDatabase(): void {
  localStorage.removeItem(SEED_FLAG)
  seedDatabase()
}
