<script setup lang="ts">
import Terminal from "@/components/Terminal.vue"
import bg from "@/assets/background_img.png"
</script>

<template>
  <div class="relative w-full min-h-screen overflow-hidden">
<!-- 
    <img
      :src = "bg"
      alt="background"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    /> -->

    <section class="w-full flex justify-between items-center gap-[625px] px-40 pt-32">

      <div class="max-w-xl text-black">
        <p class="text-xl opacity-80">Привет, меня зовут</p>
        <h1 class="text-7xl font-bold mt-2">Максим</h1>
        <p class="text-2xl opacity-90 mt-3">И я DevOps, SRE, Full-stack</p>

        <div class="flex gap-6 mt-10">
          <button class="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-80 transition">
            Проекты
          </button>

          <button class="border border-black px-8 py-3 rounded-lg text-lg hover:bg-black hover:text-white transition">
            Навыки
          </button>
        </div>
      </div>

      <div>
        <img
          src="@/assets/avatar.png"
          alt="avatar"
          class="w-[380px] object-cover"
        />
      </div>

    </section>

    <Terminal />
  </div>
</template>