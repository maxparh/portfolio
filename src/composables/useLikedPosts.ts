import { ref } from 'vue'

const STORAGE_KEY = 'liked_posts'

const readLiked = (): number[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
  } catch {
    // Повреждённые данные в localStorage не должны ломать страницу.
    return []
  }
}

const writeLiked = (ids: number[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Хранилище может быть недоступно (приватный режим) — лайк остаётся в памяти.
  }
}

/** Лайки постов блога: состояние хранится в localStorage. */
export function useLikedPosts() {
  const likedIds = ref<number[]>(readLiked())

  const isLiked = (id: number) => likedIds.value.includes(id)

  const toggleLike = (id: number): boolean => {
    const liked = !isLiked(id)
    likedIds.value = liked ? [...likedIds.value, id] : likedIds.value.filter((item) => item !== id)
    writeLiked(likedIds.value)
    return liked
  }

  return { likedIds, isLiked, toggleLike }
}
