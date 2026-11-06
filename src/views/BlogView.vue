<script setup lang="ts">
import BlogCard from '@/components/BlogCard.vue'
import { postsData } from '@/utils/posts'
</script>

<template>
  <div class="page-shell py-8 min-h-screen md:py-10">
    <div class="mb-8 flex items-end justify-between md:mb-12">
      <div>
        <h1 class="page-title font-mono">Блог</h1>
        <p class="text-slate-500 mt-2 font-mono">мысли, заметки и dev-будни</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <BlogCard v-for="post in postsData" :key="post.id" :post="post" />
    </div>
  </div>
</template>
