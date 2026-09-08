// Pruebas de la capa de datos: servicios + seed + auth, sin DOM.
import { seedDatabase, resetDatabase } from '../src/services/seed'
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from '../src/services/contract.service'
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../src/services/property.service'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../src/services/transaction.service'
import { login, logout, currentUser } from '../src/services/auth.service'
import {
  calculateMonthlyIncome,
  calculatePropertyBalance,
  calculateProfitByCity,
  calculateEstimatedIncomeByCity,
} from '../src/utils/finance'
import { getAll, KEYS } from '../src/services/storage'
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
const props0 = getProperties().length
seedDatabase()
ok(getProperties().length === props0 && props0 === 6, '6 propiedades y la recarga no duplica')
ok(getAll<UserInterface>(KEYS.users).length === 2, '2 usuarios sembrados (admin y normal)')
ok(new Set(getProperties().map((p) => p.city)).size === 3, 'propiedades repartidas en 3 ciudades')
ok(getContracts().length === 4, '4 contratos sembrados')
ok(getTransactions().length >= 12, getTransactions().length + ' transacciones sembradas (>=12)')

const tresMeses = new Date()
tresMeses.setMonth(tresMeses.getMonth() - 3)
ok(
  getTransactions().every((t) => t.date >= tresMeses.toISOString().slice(0, 10)),
  'todas las transacciones caen en los ultimos 3 meses',
)
ok(
  getProperties().every((p) => p.ownerId !== null) &&
    getAll<UserInterface>(KEYS.users).every((u) => u.properties.length > 0),
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
const nuevaProp = createProperty({
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
ok(getProperties().length === props0 + 1, 'create persiste una propiedad nueva')
ok(getPropertyById(nuevaProp.id)?.name === 'Loft Prueba', 'getPropertyById recupera la creada')
updateProperty(nuevaProp.id, { ...nuevaProp, status: PropertyStatus.ACTIVE })
ok(getPropertyById(nuevaProp.id)?.status === PropertyStatus.ACTIVE, 'update persiste el estado')
deleteProperty(nuevaProp.id)
ok(getPropertyById(nuevaProp.id) === null, 'delete elimina la propiedad')
ok(getProperties().length === props0, 'la coleccion vuelve a su tamano original')

// ---------------------------------------------------------------- #12
bloque('#12 - CRUD Contratos')
const prop = getProperties()[0]
const contratos0 = getContracts().length
const nuevo = createContract({
  propertyId: prop.id,
  fixedRent: 1500000,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  tenantName: 'Prueba QA',
  tenantContact: '3000000000',
  status: ContractStatus.ACTIVE,
})
ok(getContracts().length === contratos0 + 1, 'create persiste un contrato nuevo')
ok(
  getContracts().every((c) => getProperties().some((p) => p.id === c.propertyId)),
  'todos los contratos referencian una propiedad existente',
)
updateContract(nuevo.id, { ...nuevo, fixedRent: 1600000 })
ok(getContracts().find((c) => c.id === nuevo.id)?.fixedRent === 1600000, 'update persiste el canon')
updateContract(nuevo.id, { ...nuevo, status: ContractStatus.TERMINATED })
ok(
  getContracts().find((c) => c.id === nuevo.id)?.status === ContractStatus.TERMINATED,
  'terminar el contrato persiste (estado TERMINATED)',
)
deleteContract(nuevo.id)
ok(getContracts().length === contratos0, 'delete persiste')
ok(!getContracts().some((c) => c.id === nuevo.id), 'el contrato eliminado ya no aparece')

// ---------------------------------------------------------------- #17
bloque('#17 - CRUD Transacciones')
const tx0 = getTransactions().length
const nuevaTx = createTransaction({
  propertyId: prop.id,
  type: TransactionType.EXPENSE,
  source: TransactionSource.OTHER,
  amount: 75000,
  date: new Date().toISOString().slice(0, 10),
  description: 'Prueba QA',
})
ok(getTransactions().length === tx0 + 1, 'create persiste una transaccion nueva')
updateTransaction(nuevaTx.id, { ...nuevaTx, amount: 90000 })
ok(getTransactions().find((t) => t.id === nuevaTx.id)?.amount === 90000, 'update persiste el monto')
deleteTransaction(nuevaTx.id)
ok(getTransactions().length === tx0, 'delete persiste')

// ---------------------------------------------------------------- #19
bloque('#19 - Calculos de Reportes (utils/finance)')
const todasProps = getProperties()
const todasTx = getTransactions()
const balance = calculatePropertyBalance(todasProps[0].id, todasTx)
const txProp0 = todasTx.filter((t) => t.propertyId === todasProps[0].id)
const ingEsperado = txProp0
  .filter((t) => t.type === TransactionType.INCOME)
  .reduce((s, t) => s + t.amount, 0)
const gasEsperado = txProp0
  .filter((t) => t.type === TransactionType.EXPENSE)
  .reduce((s, t) => s + t.amount, 0)
ok(
  balance.income === ingEsperado && balance.expense === gasEsperado,
  'calculatePropertyBalance suma ingresos y gastos',
)
ok(balance.net === ingEsperado - gasEsperado, 'el neto es ingresos menos gastos')

const porCiudad = calculateProfitByCity(todasProps, todasTx)
ok(porCiudad.length === 3, 'calculateProfitByCity devuelve una fila por ciudad')
const utilidadGlobal = todasTx.reduce(
  (s, t) => s + (t.type === TransactionType.INCOME ? t.amount : -t.amount),
  0,
)
ok(
  Math.abs(porCiudad.reduce((s, c) => s + c.profit, 0) - utilidadGlobal) < 1,
  'la utilidad por ciudad suma la utilidad global',
)

const estPorCiudad = calculateEstimatedIncomeByCity(todasProps)
ok(
  estPorCiudad.reduce((s, c) => s + c.amount, 0) ===
    todasProps.reduce((s, p) => s + p.estimatedMonthlyRent, 0),
  'calculateEstimatedIncomeByCity suma el arriendo estimado total',
)
ok(typeof calculateMonthlyIncome(todasTx) === 'number', 'calculateMonthlyIncome devuelve un numero')

const soloMedellin = todasProps.filter((p) => p.city === todasProps[0].city)
ok(
  calculateProfitByCity(soloMedellin, todasTx).length === 1,
  'filtrar por ciudad reduce el grafico a esa sola ciudad',
)

// ---------------------------------------------------------------- #20
bloque('#20 - Gestion de usuarios')
ok(
  getAll<UserInterface>(KEYS.users).filter((u) => u.role === UserRole.ADMIN).length === 1,
  'hay exactamente un admin sembrado',
)
ok(getAll<UserInterface>(KEYS.users).length === 2, 'la coleccion de usuarios es legible')

// ---------------------------------------------------------------- reset
bloque('Reinicio de datos')
resetDatabase()
ok(getContracts().length === 4 && getProperties().length === 6, 'resetDatabase vuelve al seed')

console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
if (fallos > 0) process.exitCode = 1
