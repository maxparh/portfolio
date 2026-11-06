<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { loadProjects } from '@/utils/projects'

const panel = ref<HTMLDialogElement | null>(null)
const enteredKey = ref('')
const key = ref('')
const tab = ref<'posts' | 'projects'>('posts')
const busy = ref(false)
const error = ref('')
const notice = ref('')
const content = ref('')

const emptyProject = () => ({
  title: '', slug: '', category: '', type: 'py', link: '', logo: '',
  description: '', fullDescription: '', techStack: '', features: '', languages: '', screenshots: '',
})
const project = ref(emptyProject())

function onKey(event: KeyboardEvent) {
  if (!event.ctrlKey || !event.altKey || event.shiftKey || event.metaKey || event.code !== 'KeyP') return
  event.preventDefault()
  if (!panel.value?.open) panel.value?.showModal()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function signOut() {
  key.value = ''
  enteredKey.value = ''
  error.value = ''
  notice.value = ''
}

async function request(path: string, token: string, data?: object) {
  const response = await fetch('/api/admin/' + path, {
    method: data ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + token, ...(data && { 'Content-Type': 'application/json' }) },
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  if (response.status === 401) signOut()
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.error ?? 'Не удалось выполнить запрос.')
  }
}

async function run(action: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await action()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось выполнить запрос.'
  } finally {
    busy.value = false
  }
}

const login = () => run(async () => {
  const token = enteredKey.value.trim()
  await request('session', token)
  if (panel.value?.open) key.value = token
  enteredKey.value = ''
})

const publishPost = () => run(async () => {
  await request('posts', key.value, { content: content.value })
  content.value = ''
  notice.value = 'Пост опубликован.'
})

const publishProject = () => run(async () => {
  await request('projects', key.value, project.value)
  project.value = emptyProject()
  notice.value = 'Проект опубликован.'
  await loadProjects()
})
</script>

<template>
  <dialog
    ref="panel"
    aria-labelledby="admin-heading"
    class="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-900/60 md:p-7"
    @close="signOut"
  >
    <div class="mb-5 flex items-center justify-between gap-4">
      <h2 id="admin-heading" class="font-mono text-xl font-bold">Админ-панель</h2>
      <button type="button" class="secondary" @click="panel?.close()">Закрыть</button>
    </div>

    <form v-if="!key" class="space-y-4" @submit.prevent="login">
      <label>
        Ключ администратора
        <input v-model="enteredKey" type="password" autocomplete="current-password" required maxlength="64" />
      </label>
      <button class="primary" :disabled="busy">Войти</button>
    </form>

    <template v-else>
      <div class="mb-5 flex flex-wrap gap-2">
        <button type="button" class="secondary" :aria-pressed="tab === 'posts'" @click="tab = 'posts'">Пост в блог</button>
        <button type="button" class="secondary" :aria-pressed="tab === 'projects'" @click="tab = 'projects'">Новый проект</button>
      </div>

      <form v-if="tab === 'posts'" class="space-y-4" @submit.prevent="publishPost">
        <label>
          Текст поста
          <textarea v-model="content" rows="7" required maxlength="4000"></textarea>
        </label>
        <button class="primary" :disabled="busy">Опубликовать пост</button>
      </form>

      <form v-else class="grid gap-4 sm:grid-cols-2" @submit.prevent="publishProject">
        <label>Название <input v-model="project.title" required maxlength="100" /></label>
        <label>Адрес проекта <input v-model="project.slug" placeholder="my-project" required maxlength="80" /></label>
        <label>Категория <input v-model="project.category" placeholder="Python / Desktop" required maxlength="80" /></label>
        <label>
          Тип для терминала
          <select v-model="project.type">
            <option value="py">Python</option>
            <option value="rg">Rust / Go</option>
            <option value="md">Middleware</option>
            <option value="vue">Vue / Frontend</option>
          </select>
        </label>
        <label>Ссылка на репозиторий <input v-model="project.link" type="url" placeholder="https://..." maxlength="500" required /></label>
        <label>Ссылка на логотип <input v-model="project.logo" type="url" placeholder="https://..." maxlength="500" /></label>
        <label class="sm:col-span-2">Краткое описание <input v-model="project.description" required maxlength="240" /></label>
        <label class="sm:col-span-2">Полное описание <textarea v-model="project.fullDescription" rows="4" required maxlength="3000"></textarea></label>
        <label>Стек, по одному в строке <textarea v-model="project.techStack" rows="3" maxlength="2500"></textarea></label>
        <label>Возможности, по одной в строке <textarea v-model="project.features" rows="3" maxlength="2500"></textarea></label>
        <label>Языки, например Python,100,#3776AB <textarea v-model="project.languages" rows="3" maxlength="2500"></textarea></label>
        <label>Ссылки на скриншоты, по одной в строке <textarea v-model="project.screenshots" rows="3" maxlength="2500"></textarea></label>
        <button class="primary justify-self-start" :disabled="busy">Опубликовать проект</button>
      </form>
    </template>

    <p v-if="error" role="alert" class="mt-4 text-sm text-red-700">{{ error }}</p>
    <p v-if="notice" role="status" class="mt-4 text-sm text-emerald-700">{{ notice }}</p>
  </dialog>
</template>

<style scoped>
label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.875rem;
}

input, textarea, select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.primary, .secondary {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.primary, .secondary[aria-pressed='true'] {
  color: white;
  background: #0f172a;
}

.secondary {
  background: #f1f5f9;
}

.primary:disabled {
  opacity: 0.55;
  cursor: wait;
}
</style>
