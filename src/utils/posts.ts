import posts from '@/utils/posts.json'
import { shallowRef } from 'vue'

export interface Post {
  id: number
  author: string
  content: string
  date: string
}

export const postsData = shallowRef<Post[]>(posts)

export async function loadPosts() {
  try {
    const response = await fetch('/api/posts', { signal: AbortSignal.timeout(5000) })
    if (response.ok) postsData.value = await response.json()
  } catch {
    // Показываем исходные публикации, если API временно недоступен.
  }
}
