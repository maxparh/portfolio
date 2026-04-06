<script setup lang="ts">
import { projectsData } from '@/data/projects' // Импорт нашего массива
</script>

<template>
  <div class="max-w-full mx-auto px-6 md:px-60 py-10 min-h-screen font-sans">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h1 class="text-5xl font-bold font-mono text-slate-900 tracking-tighter">Проекты</h1>
        <p class="text-slate-500 mt-2 font-mono">реализованные идеи и open-source</p>
      </div>
      <div class="hidden md:block pb-1">
        <span class="text-slate-500 font-mono text-sm font-bold uppercase tracking-widest">
            count: <span class="text-slate-900">{{ projectsData.length }}</span>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in projectsData" 
        :key="project.id"
        class="group relative bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2.5rem] hover:bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] cursor-pointer"
      >
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500 overflow-hidden border border-slate-100">
            <img :src="project.logo" :alt="project.title" class="w-full h-full object-cover p-[16px] rounded-3xl" />
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-xl font-bold text-slate-800 mb-1 tracking-tight">{{ project.title }}</h3>
          <p class="text-[11px] text-[#63CDDA] font-bold font-mono mb-4 uppercase tracking-[0.2em]">{{ project.category }}</p>
          <p class="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2 px-2">{{ project.description }}</p>
          
          <div class="flex flex-wrap justify-center gap-1.5">
            <span v-for="tech in project.techStack" :key="tech" class="text-[10px] px-2.5 py-1 rounded-lg bg-slate-200/50 text-slate-600 font-medium uppercase">
              {{ tech }}
            </span>
          </div>
        </div>

        <router-link :to="'/project/' + project.slug" class="absolute inset-0 rounded-[2.5rem] z-10"></router-link>
      </div>
    </div>
  </div>
</template>