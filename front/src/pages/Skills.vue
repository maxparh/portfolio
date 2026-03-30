<template>
  <div class="max-w-full mx-auto px-6 md:px-60 py-8 min-h-screen bg-white bg-grid-pattern font-sans text-slate-900">
    
    <div class="flex justify-between items-end mb-16">
      <div>
        <h1 class="text-5xl font-bold font-mono text-slate-900 tracking-tighter">Навыки</h1>
        <p class="text-slate-500 mt-2 font-mono uppercase text-[12px] tracking-widest font-bold">stack_explorer.exe</p>
      </div>
      <div class="hidden md:block pb-1">
        <span class="text-slate-600 font-mono text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2.5 text-shadow-sm">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          online
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono items-stretch">
      
      <div class="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[550px]">
        <div class="bg-neutral-800 px-5 py-3 border-b border-neutral-700 flex justify-between items-center">
          <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">tree_view</span>
          <div class="flex gap-2">
            <div class="w-4 h-4 rounded-full bg-[#63CDDA] shadow-inner"></div>
            <div class="w-4 h-4 rounded-full bg-[#F5CD79] shadow-inner"></div>
            <div class="w-4 h-4 rounded-full bg-[#E66767] shadow-inner"></div>
          </div>
        </div>
        
        <div class="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#0A0A0A]">
          <div v-for="category in skillsTree" :key="category.name" class="mb-6">
            <button 
              @click="selectItem(category.name, 'category', category)"
              class="flex items-center gap-2 text-neutral-300 hover:text-white transition-all group mb-2 text-left"
            >
              <span class="text-[#F5CD79] text-lg select-none font-normal">📁</span>
              <span class="font-bold text-[15px] group-hover:underline uppercase tracking-tight">
                {{ category.name }}/
              </span>
            </button>
            
            <div class="ml-6 space-y-2 border-l border-neutral-800">
              <button 
                v-for="skill in category.items" 
                :key="skill.name"
                @click="selectItem(skill.name, 'skill', skill)"
                class="block pl-4 py-1 text-[13px] text-neutral-500 hover:text-[#63CDDA] transition-colors relative uppercase tracking-wider text-left w-full"
                :class="{'text-[#63CDDA] font-bold border-l-2 border-[#63CDDA] -ml-[1px] bg-[#63CDDA]/5': selectedItemName === skill.name}"
              >
                {{ skill.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[550px]">
        <div class="bg-neutral-800 px-5 py-3 border-b border-neutral-700 flex justify-between items-center">
          <span class="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">details_output</span>
          <div class="flex gap-2">
            <div class="w-4 h-4 rounded-full bg-[#63CDDA] shadow-inner"></div>
            <div class="w-4 h-4 rounded-full bg-[#F5CD79] shadow-inner"></div>
            <div class="w-4 h-4 rounded-full bg-[#E66767] shadow-inner"></div>
          </div>
        </div>
        
        <div class="p-10 flex flex-col h-full relative bg-[#0A0A0A]">
          <div class="flex-1 overflow-y-auto custom-scrollbar-thin pr-2">
            <p class="text-green-500 text-[12px] mb-8 font-mono opacity-80 tracking-widest font-bold uppercase">$ cat knowledge_base.db</p>

            <div v-if="selectedContent" class="animate-in">
              <div class="flex flex-col gap-6 pb-8 border-b border-neutral-800">
                <h3 class="text-4xl font-bold text-white tracking-tighter uppercase">
                  {{ selectedItemName }}<span class="text-[#63CDDA]">_</span>
                </h3>
                
                <div v-if="selectedType === 'skill'" class="flex items-center gap-6 py-2 px-1">
                  <div class="flex gap-3">
                    <div 
                      v-for="i in 5" :key="i"
                      class="w-4 h-4 rounded-full border border-neutral-700 transition-all duration-500"
                      :class="i <= (selectedContent.level / 20) ? 'bg-[#63CDDA] shadow-[0_0_10px_#63CDDA]' : 'bg-neutral-800'"
                    ></div>
                  </div>
                  <span class="text-[11px] font-bold text-neutral-500 font-mono tracking-widest uppercase">{{ selectedContent.level }}% proficiency</span>
                </div>
              </div>

              <div class="mt-8 space-y-8">
                <div>
                  <h4 class="text-[10px] text-green-500 uppercase font-bold tracking-[0.3em] mb-4 font-mono">// description</h4>
                  <p class="text-[15px] text-neutral-300 leading-relaxed font-sans font-bold uppercase tracking-tight">
                    {{ selectedContent.description }}
                  </p>
                </div>

                <div v-if="selectedType === 'skill'" class="flex flex-wrap gap-2">
                   <span v-for="tag in selectedContent.projects" :key="tag" 
                         class="text-[10px] px-3 py-1.5 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-none uppercase font-bold tracking-widest">
                     #{{ tag }}
                   </span>
                </div>
              </div>
            </div>

            <div v-else class="text-neutral-600 font-mono text-sm uppercase tracking-widest animate-pulse">
              [ ожидание выбора в директории... ]
            </div>
          </div>

          <div class="mt-auto pt-6 text-right select-none pointer-events-none">
            <pre class="font-mono text-[5px] md:text-[6.5px] leading-none text-neutral-800/60 inline-block text-left uppercase">
███╗   ███╗ █████╗ ██╗  ██╗██████╗  █████╗ ██████╗ ██╗  ██╗
████╗ ████║██╔══██╗╚██╗██╔╝██╔══██╗██╔══██╗██╔══██╗██║  ██║
██╔████╔██║███████║ ╚███╔╝ ██████╔╝███████║██████╔╝███████║
██║╚██╔╝██║██╔══██║ ██╔██╗ ██╔═══╝ ██╔══██║██╔══██╗██╔══██║
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗██║     ██║  ██║██║  ██║██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const skillsTree = ref([
  {
    name: 'frontend',
    description: 'разработка современных интерфейсов на vue 3, typescript и tailwind css.',
    items: [
      { name: 'vue.js', level: 80, description: 'composition api, pinia, nuxt. оптимизация и архитектура фронтенда.', projects: ['portfolio', 'bot_dashboard'] },
      { name: 'tailwind', level: 80, description: 'быстрая верстка сложных адаптивных макетов и дизайн-систем.', projects: ['portfolio', 'ui_kit'] },
      { name: 'typescript', level: 60, description: 'строгая типизация данных для повышения стабильности приложений.', projects: ['core_lib'] },
    ]
  },
  {
    name: 'backend',
    description: 'создание серверной логики, микросервисов и баз данных.',
    items: [
      { name: 'python', level: 80, description: 'разработка api на fastapi и django. автоматизация задач.', projects: ['bot_engine', 'api_gateway'] },
      { name: 'golang', level: 40, description: 'высокопроизводительные модули и микросервисная архитектура.', projects: ['auth_service'] },
      { name: 'postgresql', level: 80, description: 'проектирование бд и оптимизация сложных sql запросов.', projects: ['user_storage'] },
    ]
  },
  {
    name: 'design',
    description: 'создание серверной логики, микросервисов и баз данных.',
    items: [
      { name: 'adobe', level: 80, description: 'Работа с векторной и растровой графикой (AI/PS).', projects: ['logo', 'mockups'] },
      { name: 'figma', level: 100, description: 'Прототипирование, UI/UX, работа с компонентами.', projects: ['PortfolioUI', 'CreativeCanvas'] },
    ]
  }
])

const selectedItemName = ref<string | null>(null)
const selectedType = ref<'category' | 'skill' | null>(null)
const selectedContent = ref<any>(null)

const selectItem = (name: string, type: 'category' | 'skill', content: any) => {
  selectedItemName.value = name
  selectedType.value = type
  selectedContent.value = content
}
</script>

<style scoped>
/* Прямой запрет на курсив во всем компоненте */
* {
  font-style: normal !important;
}

.bg-grid-pattern {
  background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 0; }

.custom-scrollbar-thin::-webkit-scrollbar { width: 2px; }
.custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #333; }

.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>