<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { projectsData, type Project } from '@/utils/projects'

const router = useRouter()

const history = ref<string[]>([
  'Все права защищены. Максим Пархоменко',
  'Введите <span class="text-indigo-400">--help</span> для списка команд.',
])

const currentInput = ref('')
const terminalBody = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const projectLink = (project: Project) =>
  `<span class="term-link" data-slug="${escapeHtml(project.slug)}">${escapeHtml(project.title)}</span>`

const listProjects = (projects: Project[], withDescription = false) => {
  projects.forEach((project) => {
    const description = withDescription ? ` — ${escapeHtml(project.description)}` : ''
    addToHistory(
      `[<span class="text-indigo-300">${escapeHtml(project.type.toUpperCase())}</span>] ${projectLink(project)}${description}`,
    )
  })
}

const processCommand = (rawInput: string) => {
  const input = rawInput.trim()
  if (!input) return

  commandHistory.value.push(rawInput)
  historyIndex.value = -1

  const [first = '', ...args] = input.split(/\s+/)
  const command = first.toLowerCase()

  addToHistory(`<span class="text-green-400 font-bold">~$ > ${escapeHtml(rawInput)}</span>`)

  switch (command) {
    case '--help':
      addToHistory(`
        <div class="mt-2 text-yellow-400 font-bold underline">ДОСТУПНЫЕ КОМАНДЫ:</div>
        <div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5"><span class="text-indigo-400 sm:min-w-[100px]">projects</span><span>— список работ</span></div>
        <div class="ml-6 text-sm grid grid-cols-1 gap-0.5 text-slate-400">
          <div><span class="text-indigo-300">-a</span> : показать всё</div>
          <div><span class="text-indigo-300">-py, -vue, -rg, -md</span> : фильтр по типу</div>
          <div><span class="text-indigo-300">-p [имя]</span> : поиск проекта</div>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-0.5"><span class="text-indigo-400 sm:min-w-[100px]">open [slug]</span><span>— открыть страницу проекта</span></div>
        <div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5"><span class="text-yellow-400 sm:min-w-[100px]">clear</span><span>— очистить терминал</span></div>
      `)
      break

    case 'projects': {
      const flag = args[0]?.toLowerCase()

      if (!flag || flag === '-a') {
        listProjects(projectsData, true)
      } else if (flag === '-p') {
        const query = args.slice(1).join(' ').toLowerCase()
        const found = query ? projectsData.find((p) => p.title.toLowerCase().includes(query)) : undefined
        if (found) {
          addToHistory(`Найдено: ${projectLink(found)} — ${escapeHtml(found.description)}`)
        } else {
          addToHistory(`<span class="text-red-400">Проект "${escapeHtml(query || '...')}" не найден.</span>`)
        }
      } else {
        // Фильтр по типу (-py, -vue...)
        const typeKey = flag.replace('-', '')
        const filtered = projectsData.filter((p) => p.type === typeKey)
        if (filtered.length > 0) {
          listProjects(filtered)
        } else {
          addToHistory(`<span class="text-red-400">Флаг "${escapeHtml(flag)}" не распознан.</span>`)
        }
      }
      break
    }

    case 'open': {
      const slug = args[0]
      if (projectsData.some((p) => p.slug === slug)) {
        addToHistory(`<span class="text-green-400">Переход к ${escapeHtml(slug ?? '')}...</span>`)
        void router.push({ name: 'project-detail', params: { slug } })
      } else {
        addToHistory(
          `<span class="text-red-400">Slug "${escapeHtml(slug ?? '')}" не найден. Используйте projects -a чтобы увидеть список.</span>`,
        )
      }
      break
    }

    case 'clear':
      history.value = []
      break

    default:
      addToHistory(`Команда не найдена: <span class="text-red-500">${escapeHtml(command)}</span>.`)
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
    else {
      historyIndex.value = -1
      currentInput.value = ''
      return
    }
  }
  currentInput.value = commandHistory.value[historyIndex.value] ?? ''
}

const focusInput = () => inputEl.value?.focus()

// Клики по ссылкам внутри вывода терминала ведут через vue-router.
const handleTerminalClick = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-slug]')
  const slug = target?.dataset.slug
  if (slug) void router.push({ name: 'project-detail', params: { slug } })
}
</script>

<template>
  <section class="mt-10 font-mono md:mt-16 lg:mt-20" @click="focusInput">
    <div class="flex items-center justify-between rounded-t-xl border border-b-0 border-neutral-700 bg-neutral-800 px-3 py-2.5 text-xs font-semibold text-gray-300 md:px-5 md:py-3 md:text-sm">
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
      class="custom-scrollbar h-[380px] overflow-y-auto rounded-b-xl border border-neutral-700 bg-[#0A0A0A] p-3 text-gray-200 shadow-2xl md:h-[440px] md:p-5 lg:h-[500px] lg:p-6"
      @click="handleTerminalClick"
    >
      <!-- Выводимые строки формируются только из собственных шаблонов, пользовательский ввод экранируется. -->
      <div v-for="(line, index) in history" :key="index" class="mb-1.5">
        <div v-html="line" class="text-[13px] leading-relaxed md:text-[14px] lg:text-[15px]"></div>
      </div>

      <div class="flex items-center mt-4">
        <span class="text-green-400 mr-2 font-bold">~$</span>
        <span class="text-slate-500 mr-2">></span>
        <input
          ref="inputEl"
          v-model="currentInput"
          @keydown.enter="handleEnter"
          @keydown.up.prevent="navigateHistory('up')"
          @keydown.down.prevent="navigateHistory('down')"
          type="text"
          aria-label="Командная строка терминала"
          class="bg-transparent border-none outline-none flex-1 text-white caret-green-400 w-full"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}

input:focus {
  outline: none;
}

/* Используем :deep для стилизации v-html */
:deep(.term-link) {
  color: #818cf8;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font-weight: bold;
}
:deep(.term-link:hover) {
  color: #63cdda;
}
</style>
