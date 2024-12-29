// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  nitro: {
    preset: 'aws-lambda'
  },
  devtools: { enabled: true }
})
