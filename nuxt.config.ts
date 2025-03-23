export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/google-fonts',
    '@nuxt/ui',
  ],
  googleFonts: {
    families: {
      Sora: true,
      Inter: true,
    },
  },
  runtimeConfig: {
    supabaseKey: '',
    public: {
      supabaseUrl: '',
    },
  },
  plugins: [
    '~/plugins/supabase.js',
  ],
});