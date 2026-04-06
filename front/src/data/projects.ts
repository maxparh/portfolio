// src/data/projects.ts

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  logo: string;
  description: string;
  fullDescription: string;
  features: string[];
  techStack: string[];
  languages: { name: string; percent: number; color: string }[];
  type: 'py' | 'rg' | 'md' | 'vue';
  link: string;
  releaseLink: string;
  screenshots: string[];
}

export const projectsData: Project[] = [
  {
    id: 1,
    slug: 'cogito_AI',
    title: 'cogito_AI',
    category: 'Python / LLM',
    logo: new URL('@/assets/cogito_logo.png', import.meta.url).href,
    description: 'ИИ-ассистент помощник для студентов.',
    fullDescription: 'Чат-бот для помощи студентов на базе ИИ mistral-7b с открытым исходным кодом. Вычисления происходят локально без API других компаний, что позволяет контролировать конфиденциальность данных.',
    features: ['Анализ научных работ', 'АнтиGPT система', 'Тренажер по билетам от преподавателя'],
    techStack: ['Python', 'Ollama', 'Docker'],
    type: 'py',
    languages: [
      { name: 'python', percent: 70, color: '#3776AB' },
      { name: 'docker', percent: 20, color: '#2496ED' },
      { name: 'другие', percent: 10, color: '#94A3B8' }
    ],
    link: 'https://github.com/maxparh/cogito_AI',
    releaseLink: 'github.com/maxparh/cogito_AI',
    screenshots: [
      new URL('@/assets/projects/cogito_ai1.png', import.meta.url).href,
      new URL('@/assets/projects/cogito_ai2.png', import.meta.url).href
    ],
  },
  {
    id: 2,
    slug: 'greenway',
    title: 'Green_Way',
    category: 'Design',
    logo: new URL('@/assets/green_way_logo.png', import.meta.url).href,
    description: 'Сервис по разумному потреблению и передвижению по городу.',
    fullDescription: 'Комплексное решение для мониторинга экологического следа пользователя с элементами геймификации и социальными функциями.',
    features: ['Трекинг маршрутов', 'Калькулятор CO2', 'Интеграция с картами'],
    techStack: ['Vue 3', 'Figma', 'Tailwind'],
    type: 'vue',
    languages: [
      { name: 'vue', percent: 60, color: '#41B883' },
      { name: 'typescript', percent: 30, color: '#3178C6' },
      { name: 'tailwind', percent: 10, color: '#38BDF8' }
    ],
    link: 'https://github.com/maxparh/greenway',
    releaseLink: 'github.com/maxparh/greenway',
    screenshots: [
      new URL('@/assets/projects/greenway1.png', import.meta.url).href,
      new URL('@/assets/projects/greenway2.png', import.meta.url).href
    ],
  },
  {
    id: 3,
    slug: 'linqs',
    title: 'Linqs',
    category: 'Full-stack / Go / Vue',
    logo: new URL('@/assets/linqs_logo.png', import.meta.url).href,
    description: 'Сервис по сокращению ссылок.',
    fullDescription: 'Высоконагруженный микросервис для генерации коротких URL с аналитикой переходов и защитой от спама. Проект находится на стадии разработки',
    features: ['Мгновенная генерация', 'Аналитика кликов', 'API для разработчиков'],
    techStack: ['Vue 3', 'TS', 'Go', 'PostgreSQL'],
    type: 'rg',
    languages: [
      { name: 'go', percent: 50, color: '#00ADD8' },
      { name: 'vue', percent: 30, color: '#41B883' },
      { name: 'postgresql', percent: 20, color: '#336791' }
    ],
    link: 'https://github.com/maxparh/linqs',
    releaseLink: 'github.com/maxparh/linqs',
    screenshots: [
      new URL('@/assets/projects/linqs1.png', import.meta.url).href,
      new URL('@/assets/projects/linqs2.png', import.meta.url).href
    ],
  },
  {
    id: 4,
    slug: 'izhora_agency',
    title: 'Izhora-agency',
    category: 'Real Estate / FastAPI',
    logo: new URL('@/assets/izhora_logo.png', import.meta.url).href,
    description: 'Сайт для агентства недвижимости с CRM.',
    fullDescription: 'Автоматизированная система управления заявками и объектами недвижимости. Проект находится на стадии разработки',
    features: ['Интеграция с Telegram', 'Каталог объектов'],
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    type: 'py',
    languages: [
      { name: 'python', percent: 65, color: '#3776AB' },
      { name: 'javascript', percent: 25, color: '#F7DF1E' },
      { name: 'docker', percent: 10, color: '#2496ED' }
    ],
    link: 'https://github.com/ascendantich/izhora_agency',
    releaseLink: 'github.com/ascendantich/izhora_agency',
    screenshots: [
      new URL('@/assets/projects/izhora1.png', import.meta.url).href,
      new URL('@/assets/projects/izhora2.png', import.meta.url).href,
      new URL('@/assets/projects/izhora3.png', import.meta.url).href
    ],
  },
  {
    id: 5,
    slug: 'edelhaus',
    title: 'Edelhaus',
    category: 'Middleware / Node',
    logo: new URL('@/assets/edelhaus_logo.png', import.meta.url).href,
    description: 'CRM система для учета клиентов и заявок.',
    fullDescription: 'Система для мебельного производства, формировать и отслеживать заказыв со стороны сотрудника. Проект находится на стадии разработки',
    features: ['Поиск', 'Добавление новых позиций и клиентов', 'Учет складских остатков'],
    techStack: ['Node.js', 'Elasticsearch', 'Kibana'],
    type: 'md',
    languages: [
      { name: 'node.js', percent: 80, color: '#339933' },
      { name: 'elasticsearch', percent: 15, color: '#005571' },
      { name: 'другие', percent: 5, color: '#94A3B8' }
    ],
    link: 'https://github.com/maxparh/edelhaus',
    releaseLink: 'github.com/maxparh/edelhaus',
    screenshots: [
      new URL('@/assets/projects/edelhaus1.png', import.meta.url).href,
      new URL('@/assets/projects/edelhaus2.png', import.meta.url).href
    ],
  }
];