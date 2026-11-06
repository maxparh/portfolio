<script setup lang="ts">
import { ref } from 'vue'

const storageKey = 'portfolio_cookie_notice'
const visible = ref(true)
try {
  visible.value = localStorage.getItem(storageKey) !== 'seen'
} catch {
  // Show the notice when browser storage is unavailable.
}

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(storageKey, 'seen')
  } catch {
    // Dismiss for the current page even when storage is unavailable.
  }
}
</script>

<template>
  <aside
    v-if="visible"
    aria-label="Уведомление о cookie"
    class="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-lg sm:bottom-5 sm:px-4"
  >
    <p class="flex-1">Сайт использует cookie, чтобы запоминать ваши лайки.</p>
    <button
      type="button"
      class="shrink-0 rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
      @click="dismiss"
    >
      Понятно
    </button>
  </aside>
</template>
