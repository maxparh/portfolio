<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  name: '',
  contact: '',
  type: 'Техническая задача',
  message: ''
})

const subscribeContact = ref('') // Поле для подписки
const isSending = ref(false)
const isSubscribing = ref(false)

// --- НАСТРОЙКИ ТЕЛЕГРАМ ---
const BOT_TOKEN = '8619564100:AAGDQMH935ZAXwN6N-aizwltgGErehtAepw'
const CHAT_ID = '338735156'

// Общая функция для отправки запроса к API Telegram
const sendToTelegram = async (text: string) => {
  return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  })
}

// Отправка основной формы
const sendMessage = async () => {
  if (!form.value.message || isSending.value) return
  isSending.value = true

  const text = `
<b>🚀 Новая заявка!</b>
<b>От:</b> ${form.value.name || 'Аноним'}
<b>Связь:</b> ${form.value.contact || 'Не указана'}
<b>Тип:</b> ${form.value.type}
<b>Сообщение:</b>
${form.value.message}
  `.trim()

  try {
    const response = await sendToTelegram(text)
    if (response.ok) {
      alert('Сообщение успешно отправлено!')
      form.value = { name: '', contact: '', type: 'Техническая задача', message: '' }
    } else { throw new Error() }
  } catch (e) {
    alert('Ошибка при отправке.')
  } finally {
    isSending.value = false
  }
}

// Функционал подписки
const handleSubscribe = async () => {
  if (!subscribeContact.value || isSubscribing.value) {
    alert('Введите контактные данные')
    return
  }

  isSubscribing.value = true
  const text = `
<b>🔔 Запрос на подписку!</b>
<b>Контакт:</b> ${subscribeContact.value}
<b>Действие:</b> Пользователь хочет получать обновления.
  `.trim()

  try {
    const response = await sendToTelegram(text)
    if (response.ok) {
      alert('Вы успешно подписаны на обновления!')
      subscribeContact.value = ''
    } else { throw new Error() }
  } catch (e) {
    alert('Не удалось оформить подписку. Попробуйте позже.')
  } finally {
    isSubscribing.value = false
  }
}

const faqs = [
  { q: 'Как быстро я отвечаю?', a: 'Ответ может занять некоторое время. Все сообщения обрабатываются вручную.' },
  { q: 'Какие проекты я рассматриваю?', a: 'Технические задачи, backend-модули, интеграции и автоматизация.' },
  // ... остальные FAQ
]
</script>

<template>
  <div class="max-w-full mx-auto px-6 md:px-60 py-10 min-h-screen font-sans text-slate-900">
    
    <div class="flex justify-between items-end mb-12">
      <div>
        <h1 class="text-5xl font-bold font-mono text-slate-900 tracking-tighter">Контакты</h1>
        <p class="text-slate-500 mt-2 font-mono">давайте создадим что-то крутое</p>
      </div>
      <div class="hidden md:block pb-1">
        <span class="text-slate-600 font-mono text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          <span class="text-slate-900">online</span>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div class="space-y-10">
        <div class="bg-[#F8FAFC] border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="font-mono text-[18px] font-bold w-12 h-12 rounded-full bg-[#344054] flex items-center justify-center text-white shadow-inner">M</div>
            <span class="font-mono text-slate-700 text-[18px] font-bold tracking-tight">maxparh.dev</span>
          </div>
          <div class="flex gap-4 pt-6 border-t border-slate-200/60">
            <a href="https://github.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/telegram.svg" class="w-8 h-8" alt="TG"></a>
            <a href="https://github.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/github.svg" class="w-8 h-8" alt="GH"></a>
            <a href="https://gitlab.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/gitlab.svg" class="w-8 h-8" alt="GL"></a>
            <a href="https://www.linkedin.com/in/maksim-parkhomenko-4465003bb/" class="hover:opacity-70 transition-opacity"><img src="@/assets/linkedin.svg" class="w-8 h-8" alt="IN"></a>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2rem] shadow-sm gap-6 flex flex-col">
          <p class="text-slate-700 text-[18px] font-bold uppercase tracking-[0.2em] font-mono">Написать сообщение</p>
          
          <input v-model="form.name" type="text" placeholder="Ваше имя..." 
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm" />
          
          <input v-model="form.contact" type="text" placeholder="Способ связи (telegram, Email...)" 
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm" />
          
          <div class="relative">
            <select v-model="form.type" 
              class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition appearance-none font-mono text-sm cursor-pointer">
              <option>Техническая задача</option>
              <option>Backend-модуль</option>
              <option>Консультация</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <textarea v-model="form.message" placeholder="Ваше сообщение..." rows="5" 
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition resize-none font-mono text-sm"></textarea>
          
          <div class="flex justify-start pt-4">
            <button type="submit" :disabled="isSending" 
              class="w-full bg-[#344054] text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200 uppercase tracking-widest text-sm">
              {{ isSending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ' }}
            </button>
          </div>
        </form>
      </div>

      <div class="space-y-10 lg:pl-10">
        <div class="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2rem] shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-white shadow-sm border border-slate-100 shrink-0">
              <img src="@/assets/ad.svg" alt="" class="w-6 h-6 opacity-60">
            </div>
            <div>
              <h3 class="font-bold text-slate-900 leading-tight tracking-tight">Подписка</h3>
              <p class="text-xs text-slate-400 mt-1 font-mono">новости и апдейты</p>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <input 
              v-model="subscribeContact"
              type="text" 
              placeholder="Email или @username" 
              class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm" 
            />
            <button 
              @click="handleSubscribe"
              :disabled="isSubscribing"
              class="w-full bg-[#63CDDA] text-white py-4 rounded-xl font-bold hover:bg-[#57b9c5] transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200 uppercase tracking-widest text-sm"
            >
              {{ isSubscribing ? '...' : 'Подписаться' }}
            </button>
          </div>
        </div>

        <div class="text-slate-800 leading-relaxed space-y-6 max-w-prose font-mono px-2 text-[24px]] font-bold">
          <p>Вы можете оставить здесь сообщение, если хотите поделиться идеей, уточнить детали проекта или просто передать небольшое текстовое обращение. <br> <br>

Иногда такие сообщения помогают лучше понять контекст, уточнить технические требования или просто поддерживать связь.
Все обращения обрабатываются вручную, поэтому ответ может занять некоторое время, но каждое сообщение остаётся в системе и не теряется.</p>
          <p class="text-slate-500">/ end of contact page</p>
        </div>
      </div>
    </div>
  </div>
</template>