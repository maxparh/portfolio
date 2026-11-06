/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Тонкая обёртка над общим обработчиком из `api/contact-core.ts`.
 * Секреты читаются из окружения Pages (`context.env`) и никогда не попадают в клиент.
 */
import { handleContactRequest, type ContactEnv } from '../../api/contact-core.ts'

export type Env = ContactEnv

export const onRequest: PagesFunction<Env> = ({ request, env }) => handleContactRequest(request, env)
