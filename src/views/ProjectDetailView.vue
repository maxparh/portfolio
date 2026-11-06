<template>
  <div class="min-h-screen bg-repeat shadow-inner font-sans">
    
    <Transition name="fade">
      <div 
        v-if="selectedScreenshot" 
        class="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-sm cursor-zoom-out"
        @click="selectedScreenshot = null"
      >
        <button 
          class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          @click.stop="selectedScreenshot = null"
        >
          <svg 
          class="w-6 h-6 md:w-8 md:h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2.5" 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
        </button>

        <Transition name="scale">
          <img 
            v-if="selectedScreenshot"
            :src="selectedScreenshot" 
            alt="Увеличенный скриншот" 
            class="max-w-full max-h-full rounded-2xl shadow-2xl border-4 border-white/10 object-contain cursor-default"
            @click.stop
          />
        </Transition>
      </div>
    </Transition>

    <div v-if="project" class="page-shell py-8 animate-fade-in md:py-10">
      
      <div class="mb-6 flex items-end justify-between gap-4 md:mb-10">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tighter text-slate-900 md:text-4xl lg:text-5xl">
            {{ project.category }} / {{ project.title }}
          </h1>
        </div>

        <button
          @click="goBack"
          class="flex shrink-0 items-center gap-2 rounded-xl bg-[#334155] px-4 py-2 text-sm text-white shadow-lg transition-all hover:bg-slate-700 active:scale-95 cursor-pointer md:px-8 md:py-2.5 md:text-[18px]"
        >
          Назад
        </button>
      </div>

      <div class="mb-6 flex gap-6 overflow-x-auto border-b border-slate-200 md:mb-8 md:gap-10">
        <button 
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'pb-4 px-1 font-mono text-sm transition-all relative whitespace-nowrap',
            activeTab === tab ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
          ]"
        >
          {{ tab }}
          <div v-if="activeTab === tab" class="absolute bottom-[-1px] left-0 w-full h-[2px] bg-red-500"></div>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div class="lg:col-span-8">
          
          <div v-if="activeTab === 'Документация'" class="border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden animate-fade-in prose-content">
            <div class="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
              <span class="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest">README.md</span>
              <span class="text-[10px] text-slate-400 font-mono">v1.0.4</span>
            </div>
            
            <div class="prose prose-slate max-w-none p-5 md:p-12">
              <h2 class="text-4xl font-bold mb-8 font-mono border-b pb-4 text-slate-800">
                {{ project.title }}
              </h2>
              
              <p class="text-slate-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {{ project.fullDescription }}
              </p>

              <div class="space-y-6">
                <h3 class="text-xl font-bold font-mono text-slate-800 uppercase tracking-tight">Функции:</h3>
                <ul class="space-y-3 pl-0">
                  <li v-for="feat in project.features" :key="feat" class="flex items-start gap-3 text-slate-600">
                    <span class="text-indigo-500 mt-1">•</span>
                    {{ feat }}
                  </li>
                </ul>
              </div>

              <div class="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <p class="text-slate-500 text-sm font-mono italic">
                  {{ project.slug }} — open-source проект, ссылка на репозиторий в блоке «Релиз»
                </p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'Скриншоты'" class="animate-fade-in">
            <div v-if="project.screenshots && project.screenshots.length" class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                v-for="(img, index) in project.screenshots" 
                :key="index"
                class="group border border-slate-200 rounded-2xl bg-white p-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                @click="selectedScreenshot = img"
              >
                <div class="overflow-hidden rounded-xl aspect-video bg-slate-50">
                  <img 
                    :src="img" 
                    alt="Screenshot" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
              <p class="text-slate-400 font-mono">Галерея пуста</p>
            </div>
          </div>

          <div v-if="activeTab === 'Стек'" class="animate-fade-in rounded-xl border border-slate-300 bg-white p-5 shadow-sm md:p-12">
            <h3 class="text-xl font-bold font-mono text-slate-800 mb-6 border-b pb-4 md:mb-8 md:text-2xl">ТЕХНОЛОГИЧЕСКИЙ СТЕК</h3>
            <div class="flex flex-wrap gap-3 md:gap-4">
              <div 
                v-for="tech in project.techStack" 
                :key="tech"
                class="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 shadow-sm hover:border-indigo-300 transition-colors"
              >
                {{ tech }}
              </div>
            </div>
          </div>

        </div>

        <div class="lg:col-span-4 space-y-12 bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-fit">
          
          <section>
            <h4 class="font-bold text-slate-900 mb-5 font-mono text-lg uppercase tracking-tighter">Языки</h4>
            <div class="flex h-2.5 w-full rounded-full overflow-hidden mb-5 bg-slate-100 ring-1 ring-slate-200">
              <div 
                v-for="lang in project.languages" 
                :key="lang.name"
                :style="{ width: lang.percent + '%', backgroundColor: lang.color }"
                class="transition-all duration-1000 ease-out "
              ></div>
            </div>
            <div class="grid grid-cols-1 gap-y-3">
              <div v-for="lang in project.languages" :key="lang.name" class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: lang.color }"></span>
                  <span class="font-bold text-slate-700 font-mono">{{ lang.name }}</span>
                </div>
                <span class="text-slate-400 font-mono">{{ lang.percent }}%</span>
              </div>
            </div>
          </section>

          <section>
            <h4 class="font-bold text-slate-900 mb-5 font-mono text-lg uppercase tracking-tighter">Участники</h4>
            <div class="flex -space-x-3">
              <div class="w-12 h-12 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center text-white font-bold shadow-md cursor-help hover:-translate-y-1 transition-transform" title="Максим (Lead)">
                M
              </div>
              <div class="w-12 h-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-slate-300 font-bold border-dashed border-slate-300">
                +
              </div>
            </div>
          </section>

          <section>
            <h4 class="font-bold text-slate-900 mb-3 font-mono text-lg uppercase tracking-tighter">Релиз</h4>
            <a 
              :href="project.link" 
              target="_blank" 
              class="group flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all hover:shadow-md"
            >
              <span class="text-slate-600 text-sm font-mono truncate mr-2">{{ project.releaseLink }}</span>
              <svg class="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectsData } from '@/utils/projects'

const TABS = ['Документация', 'Скриншоты', 'Стек'] as const
type Tab = (typeof TABS)[number]

const route = useRoute()
const router = useRouter()

const tabs = TABS
const activeTab = ref<Tab>(TABS[0])

// Ссылка на увеличенный скриншот (null — модальное окно закрыто).
const selectedScreenshot = ref<string | null>(null)

const project = computed(() => {
  const slug = route.params.slug
  return projectsData.find((item) => item.slug === slug)
})

const goBack = () => {
  // Если страница открыта по прямой ссылке, истории нет — ведём к списку проектов.
  if (window.history.length > 1) router.back()
  else router.push({ name: 'projects' })
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
}

/* Стили для имитации markdown (prose) */
.prose-content h2 {
  margin-top: 0;
}

/* --- Анимации для модального окна --- */

/* Плавное появление фона (fade) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Плавное увеличение картинки (scale) */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* Пружинистый эффект */
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
}
</style>