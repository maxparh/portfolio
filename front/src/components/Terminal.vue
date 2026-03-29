<template>
  <section class="mt-20 px-40 font-mono">
    <div class="bg-neutral-900 px-5 py-3 rounded-t-lg font-semibold text-white">
      Терминал портфолио версии 1.0
    </div>

    <div class="bg-black border border-neutral-700 p-5 rounded-b-lg text-white">
      <p>Все права защищены. Максим Пархоменко</p>
      <p>Авторизация не требуется: просто начните вводить команду.</p>
      <p>Список команд: --help</p>

      <div class="mt-5 text-green-400">
        ~$ &gt; --help
      </div>

      <div class="mt-5">
        <p><strong>projects</strong> — получить ссылку на проект</p>
        <p>ключи:</p>
        <ul class="list-disc ml-6 mt-2">
          <li>-A — все проекты</li>
          <li>-py — python проекты</li>
          <li>-rg — golang backend</li>
          <li>-md — middleware</li>
          <li>-vue — фронт на Vue</li>
          <li>-P [name] — конкретный проект</li>
        </ul>
      </div>

      <div class="mt-5 text-green-400">
        ~$ &gt;
      </div>
    </div>
  </section>
</template>