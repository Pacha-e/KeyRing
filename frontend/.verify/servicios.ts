// Pruebas de la capa de datos: servicios + seed + auth, sin DOM.
import { seedDatabase, resetDatabase } from '../src/services/seed'
import * as contractService from '../src/services/contract.service'
import * as propertyService from '../src/services/property.service'
import * as transactionService from '../src/services/transaction.service'
import { login, logout, currentUser } from '../src/services/auth.service'
import {
  sumIncomeForCurrentMonth,
  summarizePropertyBalance,
  sumNetProfitByCity,
  sumEstimatedRentByCity,
} from '../src/utils/finance'
import * as storage from '../src/services/storage'
import {
  ContractStatus,
  UserRole,
  PropertyType,
  PropertyStatus,
  RentalMode,
  TransactionType,
  TransactionSource,
} from '../src/interfaces/enums'
import type { UserInterface } from '../src/interfaces/UserInterface'

let fallos = 0
const ok = (cond: boolean, msg: string) => {
  console.log((cond ? '  PASS   ' : '  FALLA  ') + msg)
  if (!cond) fallos++
}
const bloque = (t: string) => console.log('\n' + t)

// ---------------------------------------------------------------- #5
bloque('#5 - Almacenamiento LocalStorage + seed')
seedDatabase()
const props0 = propertyService.list().length
seedDatabase()
ok(propertyService.list().length === props0 && props0 === 6, '6 propiedades y la recarga no duplica')
ok(storage.findAll<UserInterface>(storage.STORAGE_KEYS.users).length === 2, '2 usuarios sembrados (admin y normal)')
ok(new Set(propertyService.list().map((p) => p.city)).size === 3, 'propiedades repartidas en 3 ciudades')
ok(contractService.list().length === 4, '4 contratos sembrados')
ok(transactionService.list().length >= 12, transactionService.list().length + ' transacciones sembradas (>=12)')

const tresMeses = new Date()
tresMeses.setMonth(tresMeses.getMonth() - 3)
ok(
  transactionService.list().every((t) => t.date >= tresMeses.toISOString().slice(0, 10)),
  'todas las transacciones caen en los ultimos 3 meses',
)
ok(
  propertyService.list().every((p) => p.ownerId !== null) &&
    storage.findAll<UserInterface>(storage.STORAGE_KEYS.users).every((u) => u.properties.length > 0),
  'cada propiedad tiene dueno y cada usuario referencia sus propiedades',
)

// ---------------------------------------------------------------- #6
bloque('#6 - Autenticacion con roles')
ok(login('admin@keyring.co', 'admin123')?.role === UserRole.ADMIN, 'admin entra con rol admin')
ok(login('user@keyring.co', 'user123')?.role === UserRole.USER, 'user entra con rol user')
ok(login('admin@keyring.co', 'clave-mala') === null, 'password incorrecto devuelve null')
ok(login('noexiste@keyring.co', 'admin123') === null, 'correo inexistente devuelve null')
login('admin@keyring.co', 'admin123')
ok(
  (currentUser() as unknown as Record<string, unknown>)?.password === undefined,
  'la sesion nunca guarda el password',
)
ok(currentUser()?.email === 'admin@keyring.co', 'la sesion persiste tras recargar')
logout()
ok(currentUser() === null, 'logout limpia la sesion')

// ---------------------------------------------------------------- #11
bloque('#11 - CRUD Propiedades')
const nuevaProp = propertyService.create({
  name: 'Loft Prueba',
  address: 'Cll 1 #2-3',
  city: 'Barranquilla',
  type: PropertyType.APARTMENT,
  rentalMode: RentalMode.AIRBNB,
  status: PropertyStatus.VACANT,
  estimatedMonthlyRent: 1000000,
  adminFee: 100000,
  otherFixedCosts: 50000,
  ownerId: null,
})
ok(propertyService.list().length === props0 + 1, 'create persiste una propiedad nueva')
ok(propertyService.findById(nuevaProp.id)?.name === 'Loft Prueba', 'getPropertyById recupera la creada')
propertyService.update(nuevaProp.id, { ...nuevaProp, status: PropertyStatus.ACTIVE })
ok(propertyService.findById(nuevaProp.id)?.status === PropertyStatus.ACTIVE, 'update persiste el estado')
propertyService.remove(nuevaProp.id)
ok(propertyService.findById(nuevaProp.id) === null, 'delete elimina la propiedad')
ok(propertyService.list().length === props0, 'la coleccion vuelve a su tamano original')

// ---------------------------------------------------------------- #12
bloque('#12 - CRUD Contratos')
const prop = propertyService.list()[0]
const contratos0 = contractService.list().length
const nuevo = contractService.create({
  propertyId: prop.id,
  fixedRent: 1500000,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  tenantName: 'Prueba QA',
  tenantContact: '3000000000',
  status: ContractStatus.ACTIVE,
})
ok(contractService.list().length === contratos0 + 1, 'create persiste un contrato nuevo')
ok(
  contractService.list().every((c) => propertyService.list().some((p) => p.id === c.propertyId)),
  'todos los contratos referencian una propiedad existente',
)
contractService.update(nuevo.id, { ...nuevo, fixedRent: 1600000 })
ok(contractService.list().find((c) => c.id === nuevo.id)?.fixedRent === 1600000, 'update persiste el canon')
contractService.update(nuevo.id, { ...nuevo, status: ContractStatus.TERMINATED })
ok(
  contractService.list().find((c) => c.id === nuevo.id)?.status === ContractStatus.TERMINATED,
  'terminar el contrato persiste (estado TERMINATED)',
)
contractService.remove(nuevo.id)
ok(contractService.list().length === contratos0, 'delete persiste')
ok(!contractService.list().some((c) => c.id === nuevo.id), 'el contrato eliminado ya no aparece')

// ---------------------------------------------------------------- #17
bloque('#17 - CRUD Transacciones')
const tx0 = transactionService.list().length
const nuevaTx = transactionService.create({
  propertyId: prop.id,
  type: TransactionType.EXPENSE,
  source: TransactionSource.OTHER,
  amount: 75000,
  date: new Date().toISOString().slice(0, 10),
  description: 'Prueba QA',
})
ok(transactionService.list().length === tx0 + 1, 'create persiste una transaccion nueva')
transactionService.update(nuevaTx.id, { ...nuevaTx, amount: 90000 })
ok(transactionService.list().find((t) => t.id === nuevaTx.id)?.amount === 90000, 'update persiste el monto')
transactionService.remove(nuevaTx.id)
ok(transactionService.list().length === tx0, 'delete persiste')

// ---------------------------------------------------------------- #19
bloque('#19 - Calculos de Reportes (utils/finance)')
const todasProps = propertyService.list()
const todasTx = transactionService.list()
const balance = summarizePropertyBalance(todasProps[0].id, todasTx)
const txProp0 = todasTx.filter((t) => t.propertyId === todasProps[0].id)
const ingEsperado = txProp0
  .filter((t) => t.type === TransactionType.INCOME)
  .reduce((s, t) => s + t.amount, 0)
const gasEsperado = txProp0
  .filter((t) => t.type === TransactionType.EXPENSE)
  .reduce((s, t) => s + t.amount, 0)
ok(
  balance.income === ingEsperado && balance.expense === gasEsperado,
  'summarizePropertyBalance suma ingresos y gastos',
)
ok(balance.net === ingEsperado - gasEsperado, 'el neto es ingresos menos gastos')

const porCiudad = sumNetProfitByCity(todasProps, todasTx)
ok(porCiudad.length === 3, 'sumNetProfitByCity devuelve una fila por ciudad')
const utilidadGlobal = todasTx.reduce(
  (s, t) => s + (t.type === TransactionType.INCOME ? t.amount : -t.amount),
  0,
)
ok(
  Math.abs(porCiudad.reduce((s, c) => s + c.profit, 0) - utilidadGlobal) < 1,
  'la utilidad por ciudad suma la utilidad global',
)

const estPorCiudad = sumEstimatedRentByCity(todasProps)
ok(
  estPorCiudad.reduce((s, c) => s + c.amount, 0) ===
    todasProps.reduce((s, p) => s + p.estimatedMonthlyRent, 0),
  'sumEstimatedRentByCity suma el arriendo estimado total',
)
ok(typeof sumIncomeForCurrentMonth(todasTx) === 'number', 'sumIncomeForCurrentMonth devuelve un numero')

const soloMedellin = todasProps.filter((p) => p.city === todasProps[0].city)
ok(
  sumNetProfitByCity(soloMedellin, todasTx).length === 1,
  'filtrar por ciudad reduce el grafico a esa sola ciudad',
)

// ---------------------------------------------------------------- #20
bloque('#20 - Gestion de usuarios')
ok(
  storage.findAll<UserInterface>(storage.STORAGE_KEYS.users).filter((u) => u.role === UserRole.ADMIN).length === 1,
  'hay exactamente un admin sembrado',
)
ok(storage.findAll<UserInterface>(storage.STORAGE_KEYS.users).length === 2, 'la coleccion de usuarios es legible')

// ---------------------------------------------------------------- reset
bloque('Reinicio de datos')
resetDatabase()
ok(contractService.list().length === 4 && propertyService.list().length === 6, 'resetDatabase vuelve al seed')

console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
if (fallos > 0) process.exitCode = 1
