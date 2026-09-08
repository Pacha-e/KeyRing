// Repositorio genérico sobre LocalStorage. Es la única parte del proyecto que
// habla con el navegador: cada colección se guarda como un arreglo JSON bajo su
// propia clave, y las cuatro entidades comparten estas mismas operaciones.
//
// Nadie fuera de services/ importa este archivo. Cuando en el Entregable 2 la
// persistencia pase a una API, solo cambia este módulo.

/** Clave de LocalStorage donde se guarda cada colección del dominio. */
export const STORAGE_KEYS = {
  users: 'keyring_users',
  properties: 'keyring_properties',
  contracts: 'keyring_contracts',
  transactions: 'keyring_transactions',
} as const

/** Cualquiera de las claves anteriores. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/** Requisito mínimo de toda entidad almacenada: tener identificador propio. */
interface StoredEntity {
  id: string
}

/**
 * Lee una colección completa desde LocalStorage.
 * Si la clave no existe o el contenido está corrupto devuelve un arreglo vacío,
 * de modo que la aplicación arranque igual en vez de romperse.
 * @param key clave de la colección
 * @returns los registros almacenados
 */
function readCollection<T>(key: StorageKey): T[] {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T[] | null) ?? []
  } catch {
    return []
  }
}

/**
 * Sobrescribe una colección completa en LocalStorage.
 * @param key clave de la colección
 * @param records registros que quedarán almacenados
 */
function writeCollection<T>(key: StorageKey, records: T[]): void {
  localStorage.setItem(key, JSON.stringify(records))
}

/**
 * Devuelve todos los registros de una colección.
 * @param key clave de la colección
 * @returns los registros almacenados
 */
export function findAll<T>(key: StorageKey): T[] {
  return readCollection<T>(key)
}

/**
 * Busca un registro por su identificador.
 * @param key clave de la colección
 * @param id identificador del registro
 * @returns el registro, o null si no existe
 */
export function findById<T extends StoredEntity>(key: StorageKey, id: string): T | null {
  return readCollection<T>(key).find((record) => record.id === id) ?? null
}

/**
 * Genera un identificador único para un registro.
 * crypto.randomUUID() solo existe en contextos seguros (HTTPS o localhost);
 * al desplegar por HTTP plano se cae a un UUID v4 construido con
 * crypto.getRandomValues(), que sí está disponible en todo contexto.
 * @returns UUID v4 como cadena
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

/**
 * Inserta un registro nuevo generándole un identificador único.
 * @param key clave de la colección
 * @param newRecord datos del registro sin identificador
 * @returns el registro insertado, ya con su id
 */
export function insert<T extends StoredEntity>(key: StorageKey, newRecord: Omit<T, 'id'>): T {
  const records = readCollection<T>(key)
  const inserted = { id: generateId(), ...newRecord } as T
  records.push(inserted)
  writeCollection(key, records)
  return inserted
}

/**
 * Aplica cambios parciales a un registro existente.
 * El identificador se preserva siempre, aunque venga en los cambios.
 * @param key clave de la colección
 * @param id identificador del registro
 * @param changes campos a modificar
 * @returns el registro actualizado, o null si el id no existe
 */
export function applyChanges<T extends StoredEntity>(
  key: StorageKey,
  id: string,
  changes: Partial<Omit<T, 'id'>>,
): T | null {
  const records = readCollection<T>(key)
  const position = records.findIndex((record) => record.id === id)
  if (position === -1) return null
  records[position] = { ...records[position], ...changes, id }
  writeCollection(key, records)
  return records[position]
}

/**
 * Elimina un registro de la colección. Si el id no existe no ocurre nada.
 * @param key clave de la colección
 * @param id identificador del registro
 */
export function deleteById(key: StorageKey, id: string): void {
  writeCollection<StoredEntity>(
    key,
    readCollection<StoredEntity>(key).filter((record) => record.id !== id),
  )
}
