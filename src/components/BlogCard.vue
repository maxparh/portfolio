<script setup lang="ts">
import { useLikedPosts } from '@/composables/useLikedPosts'
import type { Post } from '@/utils/posts'

const props = defineProps<{ post: Post }>()

const { count, liked, busy, error, toggleLike } = useLikedPosts(props.post.id)
</script>

<template>
  <div class="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
    
    <div>
      <div class="flex items-center gap-4 mb-6">
        
        <div class="font-mono text-[18px] font-bold uppercase w-12 h-12 rounded-full bg-[#344054] flex items-center justify-center text-white shadow-inner shrink-0">
          {{ post.author.charAt(0) }}
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
        :disabled="busy"
        :aria-pressed="liked"
        aria-label="Лайк"
        class="flex items-center gap-2 transition-colors duration-200 group"
        :class="liked ? 'text-rose-500' : 'hover:text-[#63CDDA]'"
      >
        <span class="text-lg" :class="{ 'font-bold animate-bounce-short': liked }">
          {{ liked ? '▲' : '^' }}
        </span> 
        <span class="group-hover:underline">{{ count ?? '—' }}</span>
      </button>
      <span class="opacity-60">{{ post.date }}</span>
    </div>
    <p v-if="error" role="status" class="mt-2 text-xs text-slate-600">{{ error }}</p>
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
