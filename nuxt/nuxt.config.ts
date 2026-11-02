// --- Exported configuration ---
export default defineNuxtConfig({
  app: { head: { title: 'KeyRing' } },
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  nitro: {
    prerender: {
      crawlLinks: false,
      // The blog task will supply this route; remove this exception when it exists.
      failOnError: false,
      routes: ['/blog'],
    },
  },
  routeRules: {
    '/blog/**': { prerender: true },
    '/properties/**': { ssr: true },
    '/tools/**': { ssr: false },
  },
  typescript: { strict: true },
});
