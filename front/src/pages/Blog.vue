<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BlogCard from '@/components/BlogCard.vue'
import postsData from '@/data/posts.json'

const posts = ref(postsData)
const showAdminModal = ref(false)
const password = ref('')

// Скрытый вход: Shift + A
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.shiftKey && e.key === 'A' || e.shiftKey && e.key === 'Ф') { // учитываем ру раскладку
    showAdminModal.value = true
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

const login = () => {
  if (password.value === 'admin') { // Поменяй на свой
    alert('Доступ разрешен. Модуль управления постами в разработке.')
    showAdminModal.value = false
  } else {
    alert('Доступ запрещен. Неверный токен.')
  }
}
</script>

<template>
  <div class="max-w-full mx-auto px-6 md:px-60 py-10 min-h-screen">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h1 class="text-5xl font-bold font-mono text-slate-900">Блог</h1>
        <p class="text-slate-500 mt-2 font-mono">мысли, заметки и dev-будни</p>
      </div>
    </div>
    
    <div class="columns-1 md:columns-2 gap-8 space-y-8">
      <div v-for="post in posts" :key="post.id" class="break-inside-avoid">
        <BlogCard :post="post" />
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAdminModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100">
          <div class="text-center mb-6">
            <div class="inline-flex p-3 rounded-full bg-slate-100 mb-4 text-2xl">🔐</div>
            <h2 class="text-xl font-bold font-mono text-slate-800">Admin Login</h2>
          </div>
          
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter access key"
            class="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center font-mono"
            @keyup.enter="login"
            autoFocus
          />
          
          <div class="flex gap-3">
            <button @click="login" class="bg-slate-900 text-white flex-[2] py-4 rounded-xl font-bold hover:bg-black transition">Verify</button>
            <button @click="showAdminModal = false" class="bg-slate-100 text-slate-500 flex-1 py-4 rounded-xl hover:bg-slate-200 transition text-sm">Esc</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Дополнительные стили для красоты */
.columns-1 {
  column-gap: 2rem;
}
</style>