/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Публичный site key Cloudflare Turnstile. Не секрет: попадает в клиентскую сборку. */
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
