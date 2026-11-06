import { onMounted, ref } from 'vue'

const legacyKey = 'liked_posts'
let visitorReady: Promise<void> | undefined

function ensureVisitor() {
  const initialize = async () => {
    const response = await fetch('/api/visitor', { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error('Не удалось определить посетителя.')
  }
  const initializeOnce = async () => {
    if (navigator.locks) await navigator.locks.request('portfolio-visitor', initialize)
    else await initialize()
  }
  visitorReady ??= initializeOnce().catch((error) => {
    visitorReady = undefined
    throw error
  })
  return visitorReady
}

function legacyLikes(): number[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(legacyKey) ?? '[]')
    return Array.isArray(ids) ? ids.filter((id) => Number.isInteger(id)) : []
  } catch {
    return []
  }
}

export function useLikedPosts(id: number) {
  const count = ref<number | null>(null)
  const liked = ref(false)
  const busy = ref(false)
  const error = ref('')

  async function request(method: 'GET' | 'PUT' | 'DELETE') {
    await ensureVisitor()
    const response = await fetch(`/api/posts/${id}/like`, {
      method,
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      throw new Error(response.status === 400 ? 'Для лайков нужны cookie.' : 'Лайки временно недоступны.')
    }
    const result: { count: number; liked: boolean } = await response.json()
    count.value = result.count
    liked.value = result.liked
  }

  async function migrateLegacyLike() {
    if (!legacyLikes().includes(id)) return
    await request('PUT')
    try {
      const remaining = legacyLikes().filter((item) => item !== id)
      if (remaining.length) localStorage.setItem(legacyKey, JSON.stringify(remaining))
      else localStorage.removeItem(legacyKey)
    } catch {
      // PUT is idempotent if the old browser storage could not be cleared.
    }
  }

  async function sync(toggle: boolean) {
    if (busy.value) return
    busy.value = true
    error.value = ''
    try {
      await migrateLegacyLike()
      if (count.value === null) await request('GET')
      if (toggle) await request(liked.value ? 'DELETE' : 'PUT')
    } catch (cause) {
      error.value = cause instanceof Error && cause.message === 'Для лайков нужны cookie.'
        ? cause.message : 'Лайки временно недоступны.'
      count.value = null
    } finally {
      busy.value = false
    }
  }

  onMounted(() => void sync(false))
  return { count, liked, busy, error, toggleLike: () => sync(true) }
}
