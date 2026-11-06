import posts from '@/utils/posts.json'

export interface Post {
  id: number
  author: string
  content: string
  likes: number
  date: string
}

/** Записи блога хранятся в JSON-файле и типизируются при загрузке. */
export const postsData: Post[] = posts
