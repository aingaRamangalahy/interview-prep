import { createApp } from 'vue'
import './style.css'

function showBootError(error: unknown) {
  const root = document.querySelector('#app')
  console.error('[flashtab] failed to mount newtab app', error)
  if (!root) return

  root.replaceChildren()

  const wrap = document.createElement('div')
  wrap.style.cssText = 'font-family: system-ui, sans-serif; padding: 2rem; max-width: 40rem; margin: 0 auto;'

  const title = document.createElement('h1')
  title.style.cssText = 'margin: 0 0 0.5rem;'
  title.textContent = 'FlashTab failed to load'

  const hint = document.createElement('p')
  hint.style.cssText = 'color: #666;'
  hint.textContent = 'Open DevTools on this tab and check the Console for details.'

  const pre = document.createElement('pre')
  pre.style.cssText = 'white-space: pre-wrap; background: #f4f1ea; padding: 1rem; border-radius: 8px;'
  pre.textContent = String(error)

  wrap.append(title, hint, pre)
  root.append(wrap)
}

async function bootstrap() {
  try {
    const { default: App } = await import('./App.vue')
    createApp(App).mount('#app')
  } catch (error) {
    showBootError(error)
  }
}

bootstrap()
