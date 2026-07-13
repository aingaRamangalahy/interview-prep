import { resolve } from 'node:path'
import { defineConfig } from 'wxt'

const DEV_HOST = '127.0.0.1'
const DEV_PORT = 3001
const DEV_ORIGIN = `http://${DEV_HOST}:${DEV_PORT}`

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'FlashTab',
    description: '5 JavaScript interview flash cards every time you open a new tab. Practice locally — no account needed.',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'flashtab@ainga.me',
        // 140+ required for data_collection_permissions (AMO)
        strict_min_version: '140.0',
        data_collection_permissions: {
          required: ['none']
        }
      },
      gecko_android: {
        // 142+ required for data_collection_permissions on Android
        strict_min_version: '142.0'
      }
    }
  },
  // Explicit origin so CSP + script tags use 127.0.0.1 (Chrome is picky about localhost in MV3)
  dev: {
    server: {
      host: DEV_HOST,
      port: DEV_PORT,
      origin: DEV_ORIGIN
    }
  },
  vite: () => ({
    resolve: {
      alias: {
        '@interview-prep/shared': resolve(__dirname, '../packages/shared/src/index.ts')
      }
    },
    server: {
      origin: DEV_ORIGIN,
      fs: {
        allow: [resolve(__dirname, '..')]
      }
    },
    optimizeDeps: {
      exclude: ['@interview-prep/shared']
    }
  })
})
