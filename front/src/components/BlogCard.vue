<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Post {
  id: number
  author: string
  content: string
  likes: number
  date: string
}

const props = defineProps<{ post: Post }>()

const isLiked = ref(false)
const localLikes = ref(props.post.likes)

onMounted(() => {
  const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]')
  if (likedPosts.includes(props.post.id)) {
    isLiked.value = true
  }
})

const toggleLike = () => {
  const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]')
  
  if (!isLiked.value) {
    isLiked.value = true
    localLikes.value++
    likedPosts.push(props.post.id)
  } else {
    isLiked.value = false
    localLikes.value--
    const index = likedPosts.indexOf(props.post.id)
    if (index > -1) likedPosts.splice(index, 1)
  }
  
  localStorage.setItem('liked_posts', JSON.stringify(likedPosts))
}
</script>

<template>
  <div class="bg-slate-50/50 backdrop-blur-sm border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300">
    <div>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
          M
        </div>
        <span class="font-medium text-slate-700 tracking-tight">{{ post.author }}</span>
      </div>
      <p class="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
        {{ post.content }}
      </p>
    </div>
    
    <div class="flex justify-between items-center mt-6 text-slate-400 text-xs font-mono">
      <button 
        @click="toggleLike"
        class="flex items-center gap-2 transition-colors duration-200 group"
        :class="isLiked ? 'text-rose-500' : 'hover:text-indigo-500'"
      >
        <span class="text-lg" :class="{'font-bold animate-bounce-short': isLiked}">
          {{ isLiked ? '▲' : '^' }}
        </span> 
        <span class="group-hover:underline">{{ localLikes }}</span>
      </button>
      <span class="opacity-60">{{ post.date }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.animate-bounce-short {
  animation: bounce-short 0.3s ease;
}
</style>