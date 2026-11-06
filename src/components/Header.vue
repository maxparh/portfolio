<script setup lang="ts">
import { ref } from 'vue'
import { NAV_LINKS } from '@/utils/navigation'

const isOpen = ref(false)
const close = () => (isOpen.value = false)
</script>

<template>
  <header class="w-full border-b border-slate-200/60">
    <div class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-10 xl:px-16">
      <!-- Логотип: не сжимается и не переносится -->
      <RouterLink
        to="/"
        class="shrink-0 whitespace-nowrap font-mono text-base font-semibold hover:opacity-80 transition-opacity md:text-lg lg:text-xl"
        @click="close"
      >
        { maxparh.dev }
      </RouterLink>

      <!-- Навигация для планшетов и десктопа -->
      <nav class="hidden items-center gap-6 font-sans text-base lg:flex lg:gap-8 lg:text-lg">
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

      <!-- Кнопка меню для мобильных -->
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        aria-label="Открыть меню"
        @click="isOpen = !isOpen"
      >
        <svg v-if="!isOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Мобильное меню -->
    <nav
      v-if="isOpen"
      id="mobile-menu"
      class="border-t border-slate-200/60 bg-white/95 backdrop-blur px-4 py-3 font-sans text-lg lg:hidden"
    >
      <ul class="flex flex-col">
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
  </header>
</template>
