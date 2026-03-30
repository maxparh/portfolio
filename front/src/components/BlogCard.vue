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
  <div class="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
    
    <div>
      <div class="flex items-center gap-4 mb-6">
        
        <div class="font-mono text-[18px] font-bold uppercase w-12 h-12 rounded-full bg-[#344054] flex items-center justify-center text-white shadow-inner shrink-0">
          {{ post.author[0] }}
        </div>
        
        <span class="font-mono text-slate-700 text-[18px] font-bold tracking-tight">
          {{ post.author }}
        </span>
      </div>

      <p class="text-slate-600 leading-relaxed text-sm whitespace-pre-line font-mono px-1">
        {{ post.content }}
      </p>
    </div>
    
    <div class="flex justify-between items-center mt-6 text-slate-400 text-xs font-mono border-t border-slate-200/60 pt-4 px-1">
      <button 
        @click="toggleLike"
        class="flex items-center gap-2 transition-colors duration-200 group"
        :class="isLiked ? 'text-rose-500' : 'hover:text-[#63CDDA]'"
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