const db = new Map()
globalThis.localStorage = {
  getItem: (k) => (db.has(k) ? db.get(k) : null),
  setItem: (k, v) => db.set(k, String(v)),
  removeItem: (k) => db.delete(k),
}
await import('./ssr/vistas.js')
