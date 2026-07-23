const productionSiteUrl = 'https://javascriptinterview.dev'
const siteUrl = process.env.NUXT_PUBLIC_APP_URL?.startsWith('http://localhost')
  ? productionSiteUrl
  : (process.env.NUXT_PUBLIC_APP_URL || productionSiteUrl)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/seo'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: siteUrl,
    name: 'javascriptinterview.dev',
    description: 'Daily JavaScript, TypeScript, and Vue interview practice with spaced repetition — hundreds of interview questions with detailed answers.',
    defaultLocale: 'en'
  },

  colorMode: {
    preference: 'dark'
  },

  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
      alt: 'javascriptinterview.dev'
    }
  },

  robots: {
    disallow: [
      '/api/',
      '/practice/session',
      '/practice/complete',
      '/settings',
      '/statistics',
      '/admin'
    ]
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'javascriptinterview.dev',
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`
    }
  },

  sitemap: {
    exclude: [
      '/practice/session',
      '/practice/complete',
      '/settings/**',
      '/statistics/**',
      '/admin/**'
    ],
    sources: ['/api/__sitemap__/urls']
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    appUserId: process.env.APP_USER_ID || 'default',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authSessionSecret: process.env.AUTH_SESSION_SECRET || '',
    adminGithubLogins: process.env.ADMIN_GITHUB_LOGINS || '',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
