<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

// --- ИНТЕРФЕЙСЫ ---
interface Project {
  name: string
  type: 'py' | 'rg' | 'md' | 'vue'
  desc: string
  link: string
}

// --- ДАННЫЕ ПРОЕКТОВ ---
const projectsData: Project[] = [
  { name: 'Bot-Engine', type: 'py', desc: 'Автоматизация Telegram', link: '#' },
  { name: 'Auth-Service', type: 'rg', desc: 'Микросервис на Go', link: '#' },
  { name: 'Logger-MW', type: 'md', desc: 'Middleware для NestJS', link: '#' },
  { name: 'Dashboard', type: 'vue', desc: 'Админка на Vue 3', link: '#' },
]

// --- СОСТОЯНИЕ (REFS) ---
const history = ref<string[]>([
  'Все права защищены. Максим Пархоменко',
  'Авторизация не требуется: просто начните вводить команду.',
  'Список команд: --help'
])

const currentInput = ref<string>('')
const terminalBody = ref<HTMLElement | null>(null)

// --- ЛОГИКА ТЕРМИНАЛА ---

// Функция для добавления строк в историю
const addToHistory = (text: string): void => {
  history.value.push(text)
  // Прокрутка вниз
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

const processCommand = (rawInput: string): void => {
  const input: string = rawInput.trim()
  const [command, ...args]: string[] = input.toLowerCase().split(' ')

  // Добавляем саму команду в историю (с сохранением регистра ввода пользователя)
  addToHistory(`<span class="text-green-400 font-bold">~$ > ${rawInput}</span>`)

  switch (command) {
    case '--help':
    // Используем одну строку или join, чтобы избежать лишних пробелов от шаблона
    const helpLines = [
      '<div class="mt-2 text-yellow-400 font-bold underline">ДОСТУПНЫЕ КОМАНДЫ:</div>',
      '<div class="flex gap-4 mt-1"><span class="text-indigo-400 min-w-[80px]">projects</span><span>— список ваших работ</span></div>',
      '<div class="text-slate-500 text-xs ml-4 mt-1 mb-1 italic">Ключи для фильтрации:</div>',
      '<div class="ml-6 text-sm grid grid-cols-1 gap-0.5">',
        '<div><span class="text-indigo-400">-A</span> — показать всё</div>',
        '<div><span class="text-indigo-400">-py</span> — Python / Django</div>',
        '<div><span class="text-indigo-400">-rg</span> — Golang / Fiber</div>',
        '<div><span class="text-indigo-400">-md</span> — Middleware / NestJS</div>',
        '<div><span class="text-indigo-400">-vue</span> — Vue 3 / TS</div>',
        '<div><span class="text-indigo-400">-P [name]</span> — поиск проекта</div>',
      '</div>',
      '<div class="flex gap-4 mt-2"><span class="text-yellow-400 min-w-[80px]">clear</span><span>— очистить экран терминала</span></div>'
    ].join('');
    
    addToHistory(helpLines);
    break;

    case 'projects':
      const key: string | undefined = args[0]
      
      if (!key || key === '-a') {
        projectsData.forEach(p => addToHistory(`[${p.type.toUpperCase()}] <a href="${p.link}" class="underline text-indigo-300">${p.name}</a> — ${p.desc}`))
      } 
      else if (key === '-p') {
        const searchName: string = args[1] ?? ''
        const project = projectsData.find(p => p.name.toLowerCase() === searchName)
        project 
          ? addToHistory(`Найдено: <a href="${project.link}" class="text-green-400 underline">${project.name}</a> [${project.type}]`)
          : addToHistory(`<span class="text-red-400">Проект "${searchName}" не найден.</span>`)
      } 
      else {
        // Фильтрация по типам (-py, -rg, etc)
        const typeFilter = key.replace('-', '') as Project['type']
        const filtered = projectsData.filter(p => p.type === typeFilter)
        
        if (filtered.length > 0) {
          filtered.forEach(p => addToHistory(`-> ${p.name}: ${p.desc}`))
        } else {
          addToHistory(`<span class="text-red-400">Ключ "${key}" не распознан или проектов нет.</span>`)
        }
      }
      break

    case 'clear':
      history.value = []
      break

    default:
      addToHistory(`Команда не найдена: <span class="text-red-500">${command}</span>. Введите <span class="text-indigo-400">--help</span>`)
  }
}

const handleEnter = (): void => {
  if (currentInput.value.trim()) {
    processCommand(currentInput.value)
    currentInput.value = ''
  }
}

const focusInput = (): void => {
  const inputElement = document.getElementById('term-input') as HTMLInputElement | null
  inputElement?.focus()
}

onMounted(() => {
  focusInput()
})
</script>

<template>
  <section class="mt-20 px-4 md:px-40 font-mono" @click="focusInput">
    <div class="bg-neutral-800 px-5 py-3 rounded-t-xl font-semibold text-gray-300 text-sm flex justify-between items-center border border-neutral-700 border-b-0">
      <div class="flex items-center gap-2 opacity-80">
        <span class="text-xs uppercase tracking-widest text-slate-400">Terminal</span>
        <span class="text-slate-500">|</span>
        <span>maxparh.dev</span>
      </div>

      <div class="flex gap-2">
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20" style="background-color: #63CDDA;"></div>
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20" style="background-color: #F5CD79;"></div>
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20" style="background-color: #FF0000;"></div>
      </div>
    </div>

    <div 
      ref="terminalBody"
      class="bg-[#0A0A0A] border border-neutral-700 p-6 rounded-b-xl text-gray-200 h-[500px] overflow-y-auto shadow-2xl custom-scrollbar"
    >
      <div v-for="(line, index) in history" :key="index" class="mb-1.5">
        <div v-html="line" class="leading-relaxed text-[15px]"></div>
      </div>

      <div class="flex items-center mt-4">
        <span class="text-green-400 mr-2 font-bold">~$</span>
        <span class="text-slate-500 mr-2">></span>
        <input 
          id="term-input"
          v-model="currentInput"
          @keydown.enter="handleEnter"
          type="text"
          class="bg-transparent border-none outline-none flex-1 text-white caret-green-400 w-full"
          autocomplete="off"
          spellcheck="false"
          autofocus
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Плавный скролл и кастомный бар */
div {
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
}

div::-webkit-scrollbar {
  width: 4px;
}

div::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}

/* Эффект свечения для текста (по желанию) */
.text-green-400 {
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.2);
}
</style>