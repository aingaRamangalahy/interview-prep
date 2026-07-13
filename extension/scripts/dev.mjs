#!/usr/bin/env node
/**
 * Watch-build script for the extension.
 *
 * WXT dev mode (HMR server) is blocked by Chrome 126+ MV3 CSP which rejects
 * http:// script sources. This script replaces it: it runs `wxt build` on
 * every file change and prints instructions to reload in Chrome.
 *
 * Usage:  node scripts/dev.mjs
 *         pnpm dev  (same thing via package.json)
 */

import { execSync } from 'node:child_process'
import { watch } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const sharedSrc = resolve(root, '../../packages/shared/src')

const WATCH_DIRS = [
  resolve(root, 'entrypoints'),
  resolve(root, 'components'),
  resolve(root, 'composables'),
  resolve(root, 'utils'),
  resolve(root, 'assets'),
  sharedSrc
].filter((d) => {
  try { return !!d } catch { return false }
})

const IGNORE = ['.output', '.wxt', 'node_modules']

let building = false
let pending = false
let debounce = null

function log(msg) {
  process.stdout.write(`[watch] ${msg}\n`)
}

function build() {
  if (building) { pending = true; return }
  building = true
  const start = Date.now()
  try {
    execSync('./node_modules/.bin/wxt build', { cwd: root, stdio: 'inherit' })
    const ms = Date.now() - start
    log(`built in ${ms}ms — reload extension in Chrome (Alt+R or chrome://extensions → ↺)`)
  } catch {
    log('build failed — check output above')
  } finally {
    building = false
    if (pending) { pending = false; build() }
  }
}

// Initial build
log('starting initial build…')
build()

// Watch for changes
for (const dir of WATCH_DIRS) {
  try {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return
      if (IGNORE.some(s => filename.includes(s))) return
      log(`changed: ${filename}`)
      clearTimeout(debounce)
      debounce = setTimeout(build, 250)
    })
  } catch {
    // dir may not exist; skip silently
  }
}

log(`watching ${WATCH_DIRS.length} directories for changes`)
log('load extension: chrome://extensions → Developer mode → Load unpacked → extension/.output/chrome-mv3')
