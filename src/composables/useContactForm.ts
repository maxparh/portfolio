import { ref } from 'vue'

export interface ContactPayload {
  action: 'message' | 'subscribe'
  token: string
  [key: string]: unknown
}

/**
 * Отправка данных формы на серверную функцию `/api/contact` (Cloudflare Pages Function).
 * Секреты (Telegram-токен, Turnstile secret) живут только на сервере.
 */
export function useContactForm() {
  const submitContact = async (data: ContactPayload): Promise<void> => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(25000),
    })

    let result: { ok?: boolean; error?: string } = {}
    try {
      result = await response.json()
    } catch {
      // Не-JSON ответ (например, 502 от прокси) — обработаем по статусу ниже.
    }

    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || 'Не удалось отправить. Попробуйте позже.')
    }
  }

  return { submitContact }
}
