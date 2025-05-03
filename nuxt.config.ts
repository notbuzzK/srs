export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/google-fonts',
    '@nuxt/ui',
    '@pinia/nuxt',
    [
      '@pinia/nuxt',
      {
        persist: true, // enable persistence for all stores
      },
    ],
  ],
  googleFonts: {
    families: {
      Sora: true,
      Inter: true,
    },
  },
  runtimeConfig: {
    // Server-side only: this will not be exposed to the client
    supabaseKey: process.env.NUXT_SUPABASE_KEY,
    public: {
      // This key will be accessible on both server and client
      supabaseUrl: process.env.NUXT_SUPABASE_URL,
      supabaseKey: process.env.NUXT_SUPABASE_KEY,
    },
  },
  plugins: [
    '~/plugins/supabase.js',
  ],
});
