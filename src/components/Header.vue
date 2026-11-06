<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_LINKS } from '@/utils/navigation'

const menu = ref<HTMLDialogElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const isOpen = ref(false)
const route = useRoute()

function open() {
  menu.value?.showModal()
  isOpen.value = true
}

function close() {
  menu.value?.close()
}

function closeOnDesktop() {
  if (menu.value?.open && trigger.value?.getClientRects().length === 0) close()
}

watch(() => route.fullPath, close)
onMounted(() => window.addEventListener('resize', closeOnDesktop))
onUnmounted(() => window.removeEventListener('resize', closeOnDesktop))
</script>

<template>
  <header class="w-full border-b border-slate-200/60">
    <div class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-10 xl:px-16">
      <RouterLink
        to="/"
        class="shrink-0 whitespace-nowrap font-mono text-base font-semibold hover:opacity-80 transition-opacity md:text-lg lg:text-xl"
      >
        { maxparh.dev }
      </RouterLink>

      <nav class="desktop-nav items-center gap-6 font-sans text-base lg:gap-8 lg:text-lg">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="whitespace-nowrap hover:opacity-70 transition border-b-2 border-transparent"
          active-class="!border-black"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <button
        ref="trigger"
        type="button"
        class="menu-trigger h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        aria-haspopup="dialog"
        aria-label="Открыть меню"
        @click="open"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <dialog
      id="mobile-menu"
      ref="menu"
      aria-label="Меню сайта"
      class="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-white p-0 text-slate-900"
      @close="isOpen = false"
    >
      <button
        type="button"
        aria-label="Закрыть меню"
        autofocus
        class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:right-6 lg:right-10"
        @click="close"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <nav aria-label="Основная навигация" class="flex min-h-full flex-col items-center px-4 py-20 font-sans text-lg">
        <ul class="my-auto flex w-full max-w-xs flex-col gap-2 text-center">
          <li v-for="link in NAV_LINKS" :key="link.to">
            <RouterLink
              :to="link.to"
              class="block rounded-lg px-3 py-3 hover:bg-slate-100 transition-colors"
              active-class="font-semibold bg-slate-100"
              @click="close"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </dialog>
  </header>
</template>

<style scoped>
.desktop-nav {
  display: none;
}

.menu-trigger {
  display: flex;
}

@media (min-width: 884px) and (orientation: landscape), (min-width: 1280px) {
  .desktop-nav {
    display: flex;
  }

  .menu-trigger {
    display: none;
  }
}

:global(html:has(#mobile-menu[open])) {
  overflow: hidden;
}
</style>
