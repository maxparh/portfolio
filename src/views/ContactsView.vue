<script setup lang="ts">
import { ref } from 'vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useContactForm } from '@/composables/useContactForm'

interface MessageForm {
  name: string
  contact: string
  type: string
  message: string
}

const MESSAGE_TYPES = ['Техническая задача', 'Backend-модуль', 'Консультация'] as const
const DEFAULT_MESSAGE_TYPE = MESSAGE_TYPES[0]

const emptyMessage = (): MessageForm => ({
  name: '',
  contact: '',
  type: DEFAULT_MESSAGE_TYPE,
  message: '',
})

const { submitContact } = useContactForm()

const form = ref<MessageForm>(emptyMessage())
const subscribeContact = ref('')
const isSending = ref(false)
const isSubscribing = ref(false)

const messageToken = ref('')
const subscribeToken = ref('')
const messageWidget = ref<InstanceType<typeof TurnstileWidget>>()
const subscribeWidget = ref<InstanceType<typeof TurnstileWidget>>()

const sendMessage = async () => {
  if (!form.value.message.trim() || !messageToken.value || isSending.value) return
  isSending.value = true
  try {
    await submitContact({ ...form.value, action: 'message', token: messageToken.value })
    alert('Сообщение успешно отправлено!')
    form.value = emptyMessage()
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Ошибка при отправке.')
  } finally {
    isSending.value = false
    messageWidget.value?.reset()
  }
}

const handleSubscribe = async () => {
  if (!subscribeContact.value.trim() || !subscribeToken.value || isSubscribing.value) return
  isSubscribing.value = true
  try {
    await submitContact({ action: 'subscribe', contact: subscribeContact.value, token: subscribeToken.value })
    alert('Запрос на подписку отправлен!')
    subscribeContact.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Не удалось отправить запрос.')
  } finally {
    isSubscribing.value = false
    subscribeWidget.value?.reset()
  }
}
</script>

<template>
  <div class="page-shell py-8 min-h-screen font-sans text-slate-900 md:py-10">
    <div class="mb-8 flex items-end justify-between md:mb-12">
      <div>
        <h1 class="page-title font-mono">Контакты</h1>
        <p class="text-slate-500 mt-2 font-mono">давайте создадим что-то крутое</p>
      </div>
      <div class="hidden pb-1 md:block">
        <span class="text-slate-600 font-mono text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          <span class="text-slate-900">online</span>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
      <div class="space-y-10">
        <div class="bg-[#F8FAFC] border border-slate-200 p-6 rounded-[2rem] shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="font-mono text-[18px] font-bold w-12 h-12 rounded-full bg-[#344054] flex items-center justify-center text-white shadow-inner">M</div>
            <span class="font-mono text-slate-700 text-[18px] font-bold tracking-tight">maxparh.dev</span>
          </div>
          <div class="flex gap-4 pt-6 border-t border-slate-200/60">
            <a href="https://github.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/telegram.svg" class="w-8 h-8" alt="TG" /></a>
            <a href="https://github.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/github.svg" class="w-8 h-8" alt="GH" /></a>
            <a href="https://gitlab.com/maxparh" class="hover:opacity-70 transition-opacity"><img src="@/assets/gitlab.svg" class="w-8 h-8" alt="GL" /></a>
            <a href="https://www.linkedin.com/in/maksim-parkhomenko-4465003bb/" class="hover:opacity-70 transition-opacity"><img src="@/assets/linkedin.png" class="w-8 h-8" alt="IN" /></a>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm md:gap-6 md:rounded-[2rem] md:p-8">
          <p class="text-slate-700 text-[18px] font-bold uppercase tracking-[0.2em] font-mono">Написать сообщение</p>

          <input
            v-model="form.name"
            maxlength="100"
            type="text"
            placeholder="Ваше имя..."
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm"
          />

          <input
            v-model="form.contact"
            maxlength="200"
            type="text"
            placeholder="Способ связи (telegram, Email...)"
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm"
          />

          <div class="relative">
            <select
              v-model="form.type"
              class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition appearance-none font-mono text-sm cursor-pointer"
            >
              <option v-for="type in MESSAGE_TYPES" :key="type">{{ type }}</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <textarea
            v-model="form.message"
            required
            maxlength="3000"
            placeholder="Ваше сообщение..."
            rows="5"
            class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition resize-none font-mono text-sm"
          ></textarea>

          <TurnstileWidget ref="messageWidget" action="message" @token="messageToken = $event" />
          <div class="flex justify-start pt-4">
            <button
              type="submit"
              :disabled="isSending || !messageToken"
              class="w-full bg-[#344054] text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200 uppercase tracking-widest text-sm"
            >
              {{ isSending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ' }}
            </button>
          </div>
        </form>
      </div>

      <div class="space-y-8 md:space-y-10 lg:pl-10">
        <div class="bg-[#F8FAFC] border border-slate-200 p-8 rounded-[2rem] shadow-sm">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-white shadow-sm border border-slate-100 shrink-0">
              <img src="@/assets/ad.svg" alt="" class="w-6 h-6 opacity-60" />
            </div>
            <div>
              <h3 class="font-bold text-slate-900 leading-tight tracking-tight">Подписка</h3>
              <p class="text-xs text-slate-400 mt-1 font-mono">новости и апдейты</p>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <input
              v-model="subscribeContact"
              maxlength="200"
              type="text"
              placeholder="Email или @username"
              class="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#63CDDA]/20 transition font-mono text-sm"
            />
            <TurnstileWidget ref="subscribeWidget" action="subscribe" @token="subscribeToken = $event" />
            <button
              @click="handleSubscribe"
              :disabled="isSubscribing || !subscribeToken || !subscribeContact.trim()"
              class="w-full bg-[#63CDDA] text-white py-4 rounded-xl font-bold hover:bg-[#57b9c5] transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200 uppercase tracking-widest text-sm"
            >
              {{ isSubscribing ? '...' : 'Подписаться' }}
            </button>
          </div>
        </div>

        <div class="max-w-prose space-y-6 px-2 font-mono text-base font-bold leading-relaxed text-slate-800 md:text-lg lg:text-2xl">
          <p>
            Вы можете оставить здесь сообщение, если хотите поделиться идеей, уточнить детали проекта или просто передать небольшое текстовое обращение.
            <br />
            <br />
            Иногда такие сообщения помогают лучше понять контекст, уточнить технические требования или просто поддерживать связь. Все обращения
            обрабатываются вручную, поэтому ответ может занять некоторое время, но каждое сообщение остаётся в системе и не теряется.
          </p>
          <p class="text-slate-500">/ end of contact page</p>
        </div>
      </div>
    </div>
  </div>
</template>
