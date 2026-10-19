<script lang="ts">
interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string
  reset(id: string): void
  remove(id: string): void
}
declare global { interface Window { turnstile?: Turnstile } }
let loading: Promise<void> | undefined
function loadScript() {
  if (window.turnstile) return Promise.resolve()
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => { loading = undefined; script.remove(); reject(new Error('Turnstile unavailable')) }
      document.head.appendChild(script)
    })
  }
  return loading
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps<{ action: 'message' | 'subscribe' }>()
const emit = defineEmits<{ token: [value: string] }>()
const container = ref<HTMLElement>()
const error = ref('')
let widget: string | undefined
let disposed = false
const reset = () => {
  emit('token', '')
  if (widget !== undefined) window.turnstile?.reset(widget)
}
defineExpose({ reset })
onMounted(async () => {
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  if (!sitekey) { error.value = 'Отправка временно недоступна.'; return }
  try {
    await loadScript()
    if (disposed || !container.value || !window.turnstile) return
    widget = window.turnstile.render(container.value, {
      sitekey, action: props.action, theme: 'light',
      callback: (token: string) => { error.value = ''; emit('token', token) },
      'expired-callback': () => emit('token', ''),
      'error-callback': () => { emit('token', ''); error.value = 'Не удалось пройти проверку. Обновите страницу.' },
    })
  } catch { error.value = 'Не удалось загрузить проверку. Обновите страницу.' }
})
onBeforeUnmount(() => {
  disposed = true
  if (widget !== undefined) window.turnstile?.remove(widget)
})
</script>

<template>
  <div>
    <div ref="container"></div>
    <p v-if="error" role="status" class="text-sm text-red-700">{{ error }}</p>
  </div>
</template>
