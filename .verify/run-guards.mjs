const db = new Map()
globalThis.localStorage = {
  getItem: (k) => (db.has(k) ? db.get(k) : null),
  setItem: (k, v) => db.set(k, String(v)),
  removeItem: (k) => db.delete(k),
}

// Mínimo necesario para que createWebHistory() funcione fuera del navegador.
const location = {
  pathname: '/',
  search: '',
  hash: '',
  host: 'localhost:5173',
  protocol: 'http:',
  href: 'http://localhost:5173/',
}
const history = {
  state: null,
  replaceState(state) {
    this.state = state
  },
  pushState(state) {
    this.state = state
  },
  go() {},
}
globalThis.window = {
  location,
  history,
  addEventListener() {},
  removeEventListener() {},
  scrollTo() {},
}
globalThis.location = location
globalThis.history = history
const nodoFalso = () => ({
  nodeType: 1,
  innerHTML: '',
  textContent: '',
  firstChild: null,
  content: { firstChild: null },
  style: {},
  classList: { add() {}, remove() {} },
  setAttribute() {},
  removeAttribute() {},
  appendChild() {},
  insertBefore() {},
  removeChild() {},
  addEventListener() {},
  removeEventListener() {},
  cloneNode: () => nodoFalso(),
})
globalThis.document = {
  baseURI: 'http://localhost:5173/',
  querySelector: () => null,
  addEventListener() {},
  createElement: nodoFalso,
  createElementNS: nodoFalso,
  createTextNode: nodoFalso,
  createComment: nodoFalso,
  head: nodoFalso(),
  body: nodoFalso(),
}

globalThis.Node = class {}
globalThis.Element = class {}
globalThis.SVGElement = class {}

await import('./guards-dist/guards.js')
