<template>
  <section class="mt-20 px-4 md:px-40 font-mono" @click="focusInput">
    <div class="bg-neutral-800 px-5 py-3 rounded-t-xl font-semibold text-gray-300 text-sm flex justify-between items-center border border-neutral-700 border-b-0">
      <div class="flex items-center gap-2 opacity-80">
        <span class="text-xs uppercase tracking-widest text-slate-400">Terminal</span>
        <span class="text-slate-500">|</span>
        <span>maxparh.dev</span>
      </div>
      <div class="flex gap-2">
        <div class="w-4 h-4 rounded-full bg-[#63CDDA]"></div>
        <div class="w-4 h-4 rounded-full bg-[#F5CD79]"></div>
        <div class="w-4 h-4 rounded-full bg-[#FF0000]"></div>
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
import { useRouter } from 'vue-router'
import { projectsData } from '@/data/projects' // Твой новый массив

const router = useRouter()
const history = ref<string[]>([
  'Все права защищены. Максим Пархоменко',
  'Введите <span class="text-indigo-400">--help</span> для списка команд.'
])

const currentInput = ref('')
const terminalBody = ref<HTMLElement | null>(null)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

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
        <div class="flex gap-4 mt-1"><span class="text-indigo-400 min-w-[100px]">projects</span><span>— список работ</span></div>
        <div class="ml-6 text-sm grid grid-cols-1 gap-0.5 text-slate-400">
          <div><span class="text-indigo-300">-a</span> : показать всё</div>
          <div><span class="text-indigo-300">-py, -vue, -rg, -md</span> : фильтр по типу</div>
          <div><span class="text-indigo-300">-p [имя]</span> : поиск проекта</div>
        </div>
        <div class="flex gap-4 mt-2"><span class="text-indigo-400 min-w-[100px]">open [slug]</span><span>— открыть страницу проекта</span></div>
        <div class="flex gap-4 mt-1"><span class="text-yellow-400 min-w-[100px]">clear</span><span>— очистить терминал</span></div>
      `)
      break

    case 'projects':
      const flag = args[0]?.toLowerCase()
      
      // Логика фильтрации
      if (!flag || flag === '-a') {
        projectsData.forEach(p => {
          addToHistory(`[<span class="text-indigo-300">${p.type.toUpperCase()}</span>] <a href="/project/${p.slug}" class="term-link">${p.title}</a> — ${p.description}`)
        })
      } 
      else if (flag === '-p') {
        const query = args.slice(1).join(' ').toLowerCase()
        const found = projectsData.find(p => p.title.toLowerCase().includes(query))
        if (found && query) {
          addToHistory(`Найдено: <a href="/project/${found.slug}" class="term-link">${found.title}</a> — ${found.description}`)
        } else {
          addToHistory(`<span class="text-red-400">Проект "${query || '...'}" не найден.</span>`)
        }
      } 
      else {
        // Фильтр по типу (-py, -vue...)
        const typeKey = flag.replace('-', '')
        const filtered = projectsData.filter(p => p.type === typeKey)
        if (filtered.length > 0) {
          filtered.forEach(p => addToHistory(`[${p.type.toUpperCase()}] <a href="/project/${p.slug}" class="term-link">${p.title}</a>`))
        } else {
          addToHistory(`<span class="text-red-400">Флаг "${flag}" не распознан.</span>`)
        }
      }
      break

    case 'open':
      const slug = args[0]
      const projectExists = projectsData.find(p => p.slug === slug)
      if (projectExists) {
        addToHistory(`<span class="text-green-400">Переход к ${slug}...</span>`)
        setTimeout(() => router.push(`/project/${slug}`), 500)
      } else {
        addToHistory(`<span class="text-red-400">Slug "${slug}" не найден. Используйте projects -a чтобы увидеть список.</span>`)
      }
      break

    case 'clear':
      history.value = []
      break

    default:
      addToHistory(`Команда не найдена: <span class="text-red-500">${command}</span>.`)
  }
}

const handleEnter = () => {
  processCommand(currentInput.value)
  currentInput.value = ''
}

const navigateHistory = (direction: 'up' | 'down') => {
  if (commandHistory.value.length === 0) return
  if (direction === 'up') {
    if (historyIndex.value === -1) historyIndex.value = commandHistory.value.length - 1
    else if (historyIndex.value > 0) historyIndex.value--
  } else {
    if (historyIndex.value !== -1 && historyIndex.value < commandHistory.value.length - 1) historyIndex.value++
    else { historyIndex.value = -1; currentInput.value = ''; return }
  }
  currentInput.value = commandHistory.value[historyIndex.value]
}

const focusInput = () => document.getElementById('term-input')?.focus()

onMounted(() => {
  focusInput()
  // Перехват кликов для Router
  terminalBody.value?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'A') {
      const href = target.getAttribute('href')
      if (href?.startsWith('/')) {
        e.preventDefault()
        router.push(href)
      }
    }
  })
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

input:focus { outline: none; }

/* Используем :deep для стилизации v-html */
:deep(.term-link) {
  color: #818CF8;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font-weight: bold;
}
:deep(.term-link:hover) {
  color: #63CDDA;
}
</style>