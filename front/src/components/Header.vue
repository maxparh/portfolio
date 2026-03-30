<template>
  <header class="w-full flex justify-between items-center py-6 gap-[625px] px-40">
    <RouterLink 
      to="/" 
      class="font-mono text-xl font-semibold hover:opacity-80 transition-opacity"
    >
      { maxparh.dev }
    </RouterLink>

    <nav class="flex gap-8 font-sans text-lg">
      <RouterLink 
        to="/" 
        class="hover:opacity-70 transition border-b-2 border-transparent"
        active-class="!border-black"
      >
        Главная
      </RouterLink>
      <RouterLink 
        to="/projects" 
        class="hover:opacity-70 transition border-b-2 border-transparent"
        active-class="!border-black"
      >
        Проекты
      </RouterLink>
      <a class="hover:opacity-70 transition" href="#">Навыки</a>
      <RouterLink 
        to="/blog" 
        class="hover:opacity-70 transition border-b-2 border-transparent"
        active-class="!border-black"
      >
      Блог
      </RouterLink>
      <RouterLink 
        to="/contacts" 
        class="hover:opacity-70 transition border-b-2 border-transparent"
        active-class="!border-black"
      >
        Контакты
      </RouterLink>
    </nav>
  </header>
</template>