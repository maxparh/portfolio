<script setup lang="ts">
import Terminal from "@/components/Terminal.vue"
</script>

<template>
  <div class="max-w-8xl mx-auto px-8 md:px-80 py-10 min-h-screen font-sans">
    
    <section class="w-full flex flex-col md:flex-row justify-between items-center gap-12 pt-20 md:pt-32 pb-20">
      
      <div class="max-w-xl text-black order-2 md:order-1 text-center md:text-left">
        <p class="text-xl font-medium opacity-60">Привет, меня зовут</p>
        <h1 class="text-6xl md:text-7xl font-bold mt-2 tracking-tight">Максим</h1>
        <p class="text-2xl opacity-80 mt-4 leading-relaxed">
          И я <span class="font-semibold text-blue-600">DevOps</span>, 
          <span class="font-semibold text-indigo-600">SRE</span>, 
          <span class="font-semibold text-slate-800">Full-stack</span>
        </p>

        <div class="flex flex-wrap justify-center md:justify-start gap-4 mt-10">
          <RouterLink to="/projects" class="bg-black text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200">
            Проекты
          </RouterLink>

          <RouterLink to="/skills" class="bg-white/50 backdrop-blur-md border border-gray-200 px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
            Навыки
          </RouterLink>
        </div>
      </div>

      <div class="relative order-1 md:order-2 group">
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-1 bg-white shadow-2xl overflow-hidden border border-gray-100">
          <div class="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src="@/assets/avatar.png"
              alt="avatar"
              class="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <div class="absolute -bottom-2 -right-2 bg-white/80 backdrop-blur-lg border border-white/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
          <span class="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-sm font-medium text-gray-700">Open to work</span>
        </div>
      </div>

    </section>

    <div class="mt-10">
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>