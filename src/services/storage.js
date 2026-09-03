// Repositorio genérico sobre LocalStorage: una colección = una clave JSON.
// Todas las entidades usan estas mismas funciones (DRY).

export const KEYS = Object.freeze({
  users: 'keyring_users',
  properties: 'keyring_properties',
  contracts: 'keyring_contracts',
  transactions: 'keyring_transactions',
})

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function write(key, items) {
  localStorage.setItem(key, JSON.stringify(items))
}

export function getAll(key) {
  return read(key)
}

export function getById(key, id) {
  return read(key).find((item) => item.id === id) ?? null
}

export function create(key, item) {
  const items = read(key)
  const nuevo = { id: crypto.randomUUID(), ...item }
  items.push(nuevo)
  write(key, items)
  return nuevo
}

export function update(key, id, cambios) {
  const items = read(key)
  const idx = items.findIndex((item) => item.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...cambios, id }
  write(key, items)
  return items[idx]
}

export function remove(key, id) {
  write(
    key,
    read(key).filter((item) => item.id !== id),
  )
}
