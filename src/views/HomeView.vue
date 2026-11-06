<script setup lang="ts">
import Terminal from '@/components/Terminal.vue'
</script>

<template>
  <div class="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 font-sans md:px-6 md:py-8 lg:px-10 xl:px-16">
    <section class="flex w-full flex-col items-center justify-between gap-10 pb-14 pt-10 md:gap-12 lg:flex-row lg:pb-20 lg:pt-20 xl:pt-28">
      <div class="max-w-xl text-black order-2 text-center lg:order-1 lg:text-left">
        <p class="text-base font-medium opacity-60 md:text-lg lg:text-xl">Привет, меня зовут</p>
        <h1 class="mt-2 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">Максим</h1>
        <p class="mt-4 text-lg leading-relaxed opacity-80 md:text-xl lg:text-2xl">
          И я <span class="font-semibold text-blue-600">DevOps</span>,
          <span class="font-semibold text-indigo-600">SRE</span>,
          <span class="font-semibold text-slate-800">Full-stack</span>
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3 md:mt-10 md:gap-4 lg:justify-start">
          <RouterLink
            to="/projects"
            class="rounded-2xl bg-black px-6 py-3 text-base font-semibold text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 active:scale-95 md:px-8 md:text-lg"
          >
            Проекты
          </RouterLink>

          <RouterLink
            to="/skills"
            class="rounded-2xl border border-gray-200 bg-white/50 px-6 py-3 text-base font-semibold shadow-sm backdrop-blur-md transition-all hover:bg-gray-50 active:scale-95 md:px-8 md:text-lg"
          >
            Навыки
          </RouterLink>
        </div>
      </div>

      <div class="relative order-1 group lg:order-2">
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 opacity-70 blur-2xl transition-opacity group-hover:opacity-100"></div>

        <div class="relative h-56 w-56 rounded-full border border-gray-100 bg-white p-1 shadow-2xl md:h-64 md:w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80">
          <div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gray-50">
            <img
              src="@/assets/avatar.png"
              alt="avatar"
              class="h-full w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <div class="absolute -bottom-2 -right-2 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/80 px-3 py-2 shadow-xl backdrop-blur-lg md:px-4">
          <span class="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-xs font-medium text-gray-700 md:text-sm">Open to work</span>
        </div>
      </div>
    </section>

    <div class="mt-6 md:mt-10">
      <Terminal />
    </div>
  </div>
</template>

<style scoped>
/* Плавное появление контента как в iOS */
section {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
