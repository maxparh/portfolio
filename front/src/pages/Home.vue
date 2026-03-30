<script setup lang="ts">
import Terminal from "@/components/Terminal.vue"

</script>

<template>
  <div class="max-w-full mx-auto px-6 md:px-20 py-10 min-h-screen">

    <section class="w-full flex justify-between items-center gap-[625px] px-40 pt-32">

      <div class="max-w-xl text-black">
        <p class="text-xl opacity-80">Привет, меня зовут</p>
        <h1 class="text-7xl font-bold mt-2">Максим</h1>
        <p class="text-2xl opacity-90 mt-3">И я DevOps, SRE, Full-stack</p>

        <div class="flex gap-6 mt-10">
          <RouterLink to="/projects" custom v-slot="{ navigate }">
            <button 
              @click="navigate"
              class="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-80 transition cursor-pointer"
            >
              Проекты
            </button>
          </RouterLink>

          <RouterLink to="/skills" custom v-slot="{ navigate }">
            <button 
              @click="navigate"
              class="border-2 border-black px-8 py-3 rounded-lg text-lg hover:bg-black hover:text-white transition cursor-pointer font-semibold"
            >
              Навыки
            </button>
          </RouterLink>
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