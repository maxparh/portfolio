<script setup lang="ts">
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
</script>

<template>
  <div class="min-h-screen text-black">
    <Header />
    <main class="pt-5">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>