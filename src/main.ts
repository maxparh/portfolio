import '@/styles/main.css'

import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { loadProjects } from '@/utils/projects'

createApp(App).use(router).mount('#app')
void loadProjects()
