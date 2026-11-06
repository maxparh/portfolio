import { shallowRef } from 'vue'
import seedProjects from './projects.json'

/** Тип проекта — используется как флаг фильтра в терминале (`projects -py`) и в карточках. */
export type ProjectType = 'py' | 'rg' | 'md' | 'vue'

export interface ProjectLanguage {
  name: string
  percent: number
  color: string
}

export interface Project {
  id: number
  slug: string
  title: string
  category: string
  logo: string
  description: string
  fullDescription: string
  features: string[]
  techStack: string[]
  languages: ProjectLanguage[]
  type: ProjectType
  link: string
  releaseLink: string
  screenshots: string[]
}

const assets = import.meta.glob<string>('@/assets/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const asset = (path: string) => {
  const bundled = assets['/src/assets/' + path]
  if (bundled) return bundled
  try {
    const url = new URL(path)
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}
const resolveAssets = (project: Project): Project => ({
  ...project,
  logo: asset(project.logo),
  screenshots: project.screenshots.map(asset).filter(Boolean),
})

export const projectsData = shallowRef((seedProjects as Project[]).map(resolveAssets))

export async function loadProjects() {
  try {
    const response = await fetch('/api/projects', { signal: AbortSignal.timeout(5000) })
    if (response.ok) projectsData.value = ((await response.json()) as Project[]).map(resolveAssets)
  } catch {
    // The bundled catalog remains available during a temporary API outage.
  }
}
