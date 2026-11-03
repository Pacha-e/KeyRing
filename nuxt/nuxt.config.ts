// --- Exported configuration ---
export default defineNuxtConfig({
  app: { head: { title: 'KeyRing' } },
  compatibilityDate: '2026-11-01',
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        '/blog',
        '/blog/how-to-calculate-rental-yield',
        '/blog/fixed-costs-every-landlord-should-track',
        '/blog/short-term-vs-long-term-rentals',
      ],
    },
  },
  routeRules: {
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/properties': { ssr: true },
    '/properties/**': { ssr: true },
    '/tools': { ssr: false },
    '/tools/**': { ssr: false },
  },
  typescript: { strict: true },
});
