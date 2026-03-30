<template>
  <section class="mt-20 px-4 md:px-40 font-mono" @click="focusInput">
    <div class="bg-neutral-800 px-5 py-3 rounded-t-xl font-semibold text-gray-300 text-sm flex justify-between items-center border border-neutral-700 border-b-0">
      <div class="flex items-center gap-2 opacity-80">
        <span class="text-xs uppercase tracking-widest text-slate-400">Terminal</span>
        <span class="text-slate-500">|</span>
        <span>maxparh.dev</span>
      </div>

      <div class="flex gap-2">
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20 bg-[#63CDDA]"></div>
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20 bg-[#F5CD79]"></div>
        <div class="w-4 h-4 rounded-full shadow-inner shadow-black/20 bg-[#FF0000]"></div>
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
          @keydown.up.prevent="navigateHistory('up')"
          @keydown.down.prevent="navigateHistory('down')"
          type="text"
          class="bg-transparent border-none outline-none flex-1 text-white caret-green-400 w-full"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

// --- ИНТЕРФЕЙСЫ ---
interface Project {
  name: string
  type: 'py' | 'rg' | 'md' | 'vue'
  desc: string
  link: string
}

// --- ДАННЫЕ (можно вынести в отдельный .ts файл) ---
const projectsData: Project[] = [
  { name: 'cogito_AI', type: 'py', desc: 'ИИ-ассистент для студентов', link: '#' },
  { name: 'Green Way', type: 'vue', desc: 'Сервис разумного потребления', link: '#' },
  { name: 'Linqs', type: 'rg', desc: 'Сокращение ссылок (Go)', link: '#' },
  { name: 'Izhora-agency', type: 'py', desc: 'CRM для недвижимости', link: '#' },
  { name: 'Edelhaus', type: 'md', desc: 'Middleware/Node CRM', link: '#' },
]

// --- СОСТОЯНИЕ ---
const history = ref<string[]>([
  'Все права защищены. Максим Пархоменко',
  'Авторизация не требуется: начните вводить команду.',
  'Список команд: <span class="text-indigo-400">--help</span>'
])

const currentInput = ref('')
const terminalBody = ref<HTMLElement | null>(null)

// Для навигации по стрелкам (как в bash)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

// --- МЕТОДЫ ---

const addToHistory = (text: string) => {
  history.value.push(text)
  nextTick(() => {
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  })
}

const processCommand = (rawInput: string) => {
  const input = rawInput.trim()
  if (!input) return

  // Сохраняем в историю команд для стрелок
  commandHistory.value.push(rawInput)
  historyIndex.value = -1

  const parts = input.split(/\s+/)
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)

  addToHistory(`<span class="text-green-400 font-bold">~$ > ${rawInput}</span>`)

  switch (command) {
    case '--help':
      addToHistory(`
        <div class="mt-2 text-yellow-400 font-bold underline">ДОСТУПНЫЕ КОМАНДЫ:</div>
        <div class="flex gap-4 mt-1"><span class="text-indigo-400 min-w-[80px]">projects</span><span>— список работ</span></div>
        <div class="text-slate-500 text-xs ml-4 mt-1 mb-1 italic">Ключи:</div>
        <div class="ml-6 text-sm grid grid-cols-1 gap-0.5">
          <div><span class="text-indigo-400">-a</span> — все проекты</div>
          <div><span class="text-indigo-400">-py</span> — Python / LLM</div>
          <div><span class="text-indigo-400">-rg</span> — Golang</div>
          <div><span class="text-indigo-400">-vue</span> — Frontend</div>
          <div><span class="text-indigo-400">-p [имя]</span> — поиск</div>
        </div>
        <div class="flex gap-4 mt-2"><span class="text-yellow-400 min-w-[80px]">clear</span><span>— очистить экран</span></div>
      `)
      break

    case 'projects':
      const flag = args[0]?.toLowerCase()
      
      if (!flag || flag === '-a') {
        projectsData.forEach(p => {
          addToHistory(`[<span class="text-indigo-300">${p.type.toUpperCase()}</span>] <a href="${p.link}" class="hover:underline text-white font-bold">${p.name}</a> — ${p.desc}`)
        })
      } 
      else if (flag === '-p') {
        const searchName = args.slice(1).join(' ').toLowerCase()
        const found = projectsData.find(p => p.name.toLowerCase().includes(searchName))
        if (found && searchName) {
          addToHistory(`Найдено: <span class="text-green-400">${found.name}</span> — ${found.desc}`)
        } else {
          addToHistory(`<span class="text-red-400">Проект "${searchName || '...'}" не найден.</span>`)
        }
      } 
      else {
        const typeFilter = flag.replace('-', '') as Project['type']
        const filtered = projectsData.filter(p => p.type === typeFilter)
        if (filtered.length > 0) {
          filtered.forEach(p => addToHistory(`<span class="text-indigo-400">-></span> ${p.name}: ${p.desc}`))
        } else {
          addToHistory(`<span class="text-red-400">Тип "${flag}" не найден.</span>`)
        }
      }
      break

    case 'clear':
      history.value = []
      break

    default:
      addToHistory(`Команда не найдена: <span class="text-red-500">${command}</span>. Используйте <span class="text-indigo-400">--help</span>`)
  }
}

const handleEnter = () => {
  processCommand(currentInput.value)
  currentInput.value = ''
}

// Навигация по истории команд (стрелки вверх/вниз)
const navigateHistory = (direction: 'up' | 'down') => {
  if (commandHistory.value.length === 0) return

  if (direction === 'up') {
    if (historyIndex.value === -1) historyIndex.value = commandHistory.value.length - 1
    else if (historyIndex.value > 0) historyIndex.value--
  } else {
    if (historyIndex.value === -1) return
    if (historyIndex.value < commandHistory.value.length - 1) historyIndex.value++
    else {
      historyIndex.value = -1
      currentInput.value = ''
      return
    }
  }
  currentInput.value = commandHistory.value[historyIndex.value]
}

const focusInput = () => {
  document.getElementById('term-input')?.focus()
}

onMounted(() => {
  focusInput()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
.text-green-400 {
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.2);
}
/* Убираем стандартное выделение при клике в некоторых браузерах */
input:focus {
  ring: none;
  box-shadow: none;
}
</style>