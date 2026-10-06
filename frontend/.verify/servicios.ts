// Pruebas de integración de la capa de servicios contra la API real (Nest.js).
// La API debe estar corriendo en http://localhost:3000 (backend/ npm run start).
// La suite crea y destruye sus propios datos de prueba vía la propia API.
import * as contractService from '../src/services/contract.service'
import * as propertyService from '../src/services/property.service'
import * as transactionService from '../src/services/transaction.service'
import * as userService from '../src/services/user.service'
import { login, logout, currentUser } from '../src/services/auth.service'
import {
  sumIncomeForCurrentMonth,
  summarizePropertyBalance,
  sumNetProfitByCity,
  sumEstimatedRentByCity,
} from '../src/utils/finance'
import {
  ContractStatus,
  UserRole,
  PropertyType,
  PropertyStatus,
  RentalMode,
  TransactionType,
  TransactionSource,
} from '../src/interfaces/enums'

let fallos = 0
const ok = (cond: boolean, msg: string) => {
  console.log((cond ? '  PASS   ' : '  FALLA  ') + msg)
  if (!cond) fallos++
}
const bloque = (t: string) => console.log('\n' + t)

// Estado inicial que garantiza el seed del backend.
const BASE = { properties: 6, contracts: 4, transactions: 12, users: 2 }

bloque('#5 - Datos sembrados por la API')
{
  const properties = await propertyService.list()
  ok(properties.length === BASE.properties, `6 propiedades sembradas`)
  ok(new Set(properties.map((p) => p.city)).size === 3, 'propiedades repartidas en 3 ciudades')
  const contracts = await contractService.list()
  ok(contracts.length === BASE.contracts, '4 contratos sembrados')
  const transactions = await transactionService.list()
  ok(transactions.length >= BASE.transactions, `${transactions.length} transacciones sembradas (>=12)`)
  const users = await userService.list()
  ok(users.length === BASE.users, '2 usuarios sembrados')
  ok(
    users.every((u) => (u as unknown as { password?: string }).password === undefined),
    'la API nunca devuelve contraseñas',
  )
}

bloque('#6 - Autenticación con roles')
{
  const admin = await login('admin@keyring.co', 'admin123')
  ok(admin?.role === UserRole.ADMIN, 'admin entra con rol admin')
  const user = await login('user@keyring.co', 'user123')
  ok(user?.role === UserRole.USER, 'user entra con rol user')
  ok((await login('admin@keyring.co', 'clave-mala')) === null, 'password incorrecto devuelve null')
  ok((await login('noexiste@keyring.co', 'admin123')) === null, 'correo inexistente devuelve null')
  await login('admin@keyring.co', 'admin123')
  ok(currentUser()?.email === 'admin@keyring.co', 'la sesión persiste tras recargar')
  const session = currentUser() as unknown as Record<string, unknown> | null
  ok(session?.password === undefined, 'la sesión nunca guarda el password')
  logout()
  ok(currentUser() === null, 'logout limpia la sesión')
}

bloque('#11 - CRUD Propiedades contra la API')
{
  const before = (await propertyService.list()).length
  const nueva = await propertyService.create({
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
  ok((await propertyService.list()).length === before + 1, 'create persiste una propiedad nueva')
  ok((await propertyService.findById(nueva.id))?.name === 'Loft Prueba', 'findById recupera la creada')
  await propertyService.update(nueva.id, { status: PropertyStatus.ACTIVE })
  ok((await propertyService.findById(nueva.id))?.status === PropertyStatus.ACTIVE, 'update persiste el estado')
  await propertyService.remove(nueva.id)
  ok((await propertyService.findById(nueva.id)) === null, 'delete elimina la propiedad')
  ok((await propertyService.list()).length === before, 'la coleccion vuelve a su tamano original')
}

bloque('#11b - Visibilidad por rol (regla de la API)')
{
  const admin = await login('admin@keyring.co', 'admin123')
  const user = await login('user@keyring.co', 'user123')
  const delAdmin = await propertyService.listForUser(admin)
  const delUser = await propertyService.listForUser(user)
  ok(delAdmin.length === BASE.properties, 'el admin ve todas las propiedades')
  ok(delUser.length < delAdmin.length, 'el user ve menos propiedades que el admin')
  ok((await propertyService.listForUser(null)).length === 0, 'sin sesion no se ve nada')
}

bloque('#12 - CRUD Contratos contra la API')
{
  const prop = (await propertyService.list())[0]
  const contratos0 = (await contractService.list()).length
  const nuevo = await contractService.create({
    propertyId: prop.id,
    fixedRent: 1500000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    tenantName: 'Prueba QA',
    tenantContact: '3000000000',
    status: ContractStatus.ACTIVE,
  })
  ok((await contractService.list()).length === contratos0 + 1, 'create persiste un contrato nuevo')
  const props = await propertyService.list()
  const contratos = await contractService.list()
  ok(
    contratos.every((c) => props.some((p) => p.id === c.propertyId)),
    'todos los contratos referencian una propiedad existente',
  )
  await contractService.update(nuevo.id, { fixedRent: 1600000 })
  ok(
    (await contractService.list()).find((c) => c.id === nuevo.id)?.fixedRent === 1600000,
    'update persiste el canon',
  )
  await contractService.update(nuevo.id, { status: ContractStatus.TERMINATED })
  ok(
    (await contractService.list()).find((c) => c.id === nuevo.id)?.status === ContractStatus.TERMINATED,
    'terminar el contrato persiste (estado TERMINATED)',
  )
  await contractService.remove(nuevo.id)
  ok((await contractService.list()).length === contratos0, 'delete persiste')
}

bloque('#17 - CRUD Transacciones contra la API')
{
  const prop = (await propertyService.list())[0]
  const tx0 = (await transactionService.list()).length
  const nueva = await transactionService.create({
    propertyId: prop.id,
    type: TransactionType.EXPENSE,
    source: TransactionSource.OTHER,
    amount: 75000,
    date: new Date().toISOString().slice(0, 10),
    description: 'Prueba QA',
  })
  ok((await transactionService.list()).length === tx0 + 1, 'create persiste una transaccion nueva')
  await transactionService.update(nueva.id, { amount: 90000 })
  ok(
    (await transactionService.list()).find((t) => t.id === nueva.id)?.amount === 90000,
    'update persiste el monto',
  )
  await transactionService.remove(nueva.id)
  ok((await transactionService.list()).length === tx0, 'delete persiste')
}

bloque('#19 - Calculos de Reportes (utils/finance)')
{
  const props = await propertyService.list()
  const txs = await transactionService.list()
  const balance = summarizePropertyBalance(props[0].id, txs)
  const txProp0 = txs.filter((t) => t.propertyId === props[0].id)
  const ing = txProp0.filter((t) => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0)
  const gas = txProp0.filter((t) => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0)
  ok(balance.income === ing && balance.expense === gas, 'summarizePropertyBalance suma ingresos y gastos')
  ok(balance.net === ing - gas, 'el neto es ingresos menos gastos')
  const porCiudad = sumNetProfitByCity(props, txs)
  ok(porCiudad.length === 3, 'sumNetProfitByCity devuelve una fila por ciudad')
  const global = txs.reduce((s, t) => s + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0)
  ok(Math.abs(porCiudad.reduce((s, c) => s + c.profit, 0) - global) < 1, 'la utilidad por ciudad suma la global')
  const est = sumEstimatedRentByCity(props)
  ok(
    est.reduce((s, c) => s + c.amount, 0) === props.reduce((s, p) => s + p.estimatedMonthlyRent, 0),
    'sumEstimatedRentByCity suma el arriendo estimado total',
  )
  ok(typeof sumIncomeForCurrentMonth(txs) === 'number', 'sumIncomeForCurrentMonth devuelve un numero')
}

bloque('#20 - Gestion de usuarios (API)')
{
  const users = await userService.list()
  ok(users.filter((u) => u.role === UserRole.ADMIN).length === 1, 'hay exactamente un admin sembrado')
  ok(await userService.emailTaken('admin@keyring.co'), 'emailTaken detecta el correo del admin')
  ok(!(await userService.emailTaken('libre@keyring.co')), 'un correo libre no esta tomado')
  const creado = await userService.create({
    fullName: 'QA Temporal',
    email: 'qa-temporal@keyring.co',
    password: 'clave123',
    phone: '3009998877',
    city: 'Medellin',
    memberSince: new Date().toISOString().slice(0, 10),
    role: UserRole.USER,
  })
  ok((await userService.findById(creado.id))?.email === 'qa-temporal@keyring.co', 'create persiste un usuario')
  const motivo = await userService.blockedFromRemoval(creado.id, creado.id)
  ok(motivo !== null, 'uno no puede eliminarse a si mismo')
  await userService.remove(creado.id)
  ok((await userService.findById(creado.id)) === null, 'delete elimina al usuario temporal')
}

console.log('\n' + (fallos === 0 ? 'TODO VERDE' : fallos + ' FALLAS'))
if (fallos > 0) process.exitCode = 1
