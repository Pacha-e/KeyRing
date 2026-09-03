// Repositorio genérico sobre LocalStorage: una colección = una clave JSON.
// Todas las entidades usan estas mismas funciones (DRY).

export const KEYS = {
  users: 'keyring_users',
  properties: 'keyring_properties',
  contracts: 'keyring_contracts',
  transactions: 'keyring_transactions',
} as const

export type CollectionKey = (typeof KEYS)[keyof typeof KEYS]

interface Entity {
  id: string
}

function read<T>(key: CollectionKey): T[] {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T[] | null) ?? []
  } catch {
    return []
  }
}

function write<T>(key: CollectionKey, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

export function getAll<T>(key: CollectionKey): T[] {
  return read<T>(key)
}

export function getById<T extends Entity>(key: CollectionKey, id: string): T | null {
  return read<T>(key).find((item) => item.id === id) ?? null
}

export function create<T extends Entity>(key: CollectionKey, item: Omit<T, 'id'>): T {
  const items = read<T>(key)
  const nuevo = { id: crypto.randomUUID(), ...item } as T
  items.push(nuevo)
  write(key, items)
  return nuevo
}

export function update<T extends Entity>(
  key: CollectionKey,
  id: string,
  cambios: Partial<Omit<T, 'id'>>,
): T | null {
  const items = read<T>(key)
  const idx = items.findIndex((item) => item.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...cambios, id }
  write(key, items)
  return items[idx]
}

export function remove(key: CollectionKey, id: string): void {
  write<Entity>(
    key,
    read<Entity>(key).filter((item) => item.id !== id),
  )
}
