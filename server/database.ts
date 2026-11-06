import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { ContactSubmission } from '../api/contact-core.ts'

interface SeedProject {
  id: number
  slug: string
  title: string
  category: string
  logo: string
  description: string
  fullDescription: string
  features: string[]
  techStack: string[]
  languages: { name: string; percent: number; color: string }[]
  type: string
  link: string
  releaseLink: string
  screenshots: string[]
}

export type ProjectInput = Omit<SeedProject, 'id'>

export function openDatabase(path: string) {
  mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  try {
    db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
    migrate(db)
    return db
  } catch (error) {
    db.close()
    throw error
  }
}

function migrate(db: DatabaseSync) {
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS portfolio_migrations (version INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT current_timestamp
      );
      CREATE TABLE IF NOT EXISTS blog_likes (
        post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        visitor_id TEXT NOT NULL,
        PRIMARY KEY (post_id, visitor_id)
      );
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        position INTEGER NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        logo TEXT NOT NULL,
        description TEXT NOT NULL,
        full_description TEXT NOT NULL,
        features TEXT NOT NULL CHECK (json_valid(features)),
        tech_stack TEXT NOT NULL CHECK (json_valid(tech_stack)),
        languages TEXT NOT NULL CHECK (json_valid(languages)),
        type TEXT NOT NULL CHECK (type IN ('py', 'rg', 'md', 'vue')),
        link TEXT NOT NULL,
        release_link TEXT NOT NULL,
        screenshots TEXT NOT NULL CHECK (json_valid(screenshots))
      );
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY,
        action TEXT NOT NULL CHECK (action IN ('message', 'subscribe')),
        name TEXT,
        contact TEXT NOT NULL,
        type TEXT,
        message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at INTEGER NOT NULL DEFAULT (unixepoch()),
        claim_token TEXT,
        claim_until INTEGER,
        sent_at INTEGER,
        CHECK (action = 'subscribe' OR (type IS NOT NULL AND message IS NOT NULL))
      );
      CREATE INDEX IF NOT EXISTS contact_pending ON contact_submissions(next_attempt_at, id)
        WHERE sent_at IS NULL;
    `)
    if (!db.prepare('SELECT 1 FROM portfolio_migrations WHERE version = 1').get()) {
      seed(db)
      db.exec('INSERT INTO portfolio_migrations VALUES (1)')
    }
    if (!db.prepare('SELECT 1 FROM portfolio_migrations WHERE version = 2').get()) {
      db.exec(`
        ALTER TABLE blog_posts ADD COLUMN author TEXT NOT NULL DEFAULT 'maxparh.dev';
        ALTER TABLE blog_posts ADD COLUMN display_date TEXT NOT NULL DEFAULT '';
      `)
      const posts: { id: number; author: string; date: string }[] = JSON.parse(readFileSync('src/utils/posts.json', 'utf8'))
      const update = db.prepare('UPDATE blog_posts SET author = ?, display_date = ? WHERE id = ?')
      for (const post of posts) update.run(post.author, post.date, post.id)
      db.exec('INSERT INTO portfolio_migrations VALUES (2)')
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

function seed(db: DatabaseSync) {
  const posts: { id: number; content: string }[] = JSON.parse(readFileSync('src/utils/posts.json', 'utf8'))
  const insertPost = db.prepare('INSERT INTO blog_posts (id, content) VALUES (?, ?) ON CONFLICT(id) DO NOTHING')
  for (const post of posts) insertPost.run(post.id, post.content)

  const projects: SeedProject[] = JSON.parse(readFileSync('src/utils/projects.json', 'utf8'))
  const insertProject = db.prepare(`
    INSERT INTO projects (id, position, slug, title, category, logo, description, full_description,
      features, tech_stack, languages, type, link, release_link, screenshots)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `)
  for (const [position, project] of projects.entries()) {
    insertProject.run(project.id, position, project.slug, project.title, project.category, project.logo,
      project.description, project.fullDescription, JSON.stringify(project.features),
      JSON.stringify(project.techStack), JSON.stringify(project.languages), project.type,
      project.link, project.releaseLink, JSON.stringify(project.screenshots))
  }
}

export function createStore(db: DatabaseSync) {
  const posts = db.prepare(`
    SELECT id, author, content, coalesce(nullif(display_date, ''), date(created_at)) AS date
    FROM blog_posts ORDER BY (display_date = '') DESC, CASE WHEN display_date = '' THEN -id ELSE id END
  `)
  const publishPost = db.prepare('INSERT INTO blog_posts (content) VALUES (?) RETURNING id')
  const publishProject = db.prepare(`
    INSERT INTO projects (position, slug, title, category, logo, description, full_description,
      features, tech_stack, languages, type, link, release_link, screenshots)
    VALUES ((SELECT coalesce(min(position), 0) - 1 FROM projects), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO NOTHING
    RETURNING id
  `)
  const projects = db.prepare(`
    SELECT id, slug, title, category, logo, description, full_description AS fullDescription,
      features, tech_stack AS techStack, languages, type, link, release_link AS releaseLink, screenshots
    FROM projects ORDER BY position, id
  `)
  const likes = db.prepare(`
    SELECT count(l.visitor_id) AS count, coalesce(max(l.visitor_id = ?), 0) AS liked
    FROM blog_posts p LEFT JOIN blog_likes l ON l.post_id = p.id
    WHERE p.id = ? GROUP BY p.id
  `)
  const addLike = db.prepare('INSERT INTO blog_likes VALUES (?, ?) ON CONFLICT DO NOTHING')
  const removeLike = db.prepare('DELETE FROM blog_likes WHERE post_id = ? AND visitor_id = ?')
  const insertSubmission = db.prepare(`
    INSERT INTO contact_submissions (action, name, contact, type, message) VALUES (?, ?, ?, ?, ?)
  `)
  const claim = db.prepare(`
    UPDATE contact_submissions SET claim_token = ?, claim_until = unixepoch() + 120, attempts = attempts + 1
    WHERE id = (
      SELECT id FROM contact_submissions
      WHERE sent_at IS NULL AND next_attempt_at <= unixepoch()
        AND (claim_until IS NULL OR claim_until <= unixepoch())
      ORDER BY next_attempt_at, id LIMIT 1
    )
    RETURNING id, action, name, contact, type, message, claim_token AS claimToken
  `)
  const complete = db.prepare(`
    UPDATE contact_submissions SET sent_at = unixepoch(), claim_token = NULL, claim_until = NULL
    WHERE id = ? AND claim_token = ? AND sent_at IS NULL
  `)
  const retry = db.prepare(`
    UPDATE contact_submissions
    SET next_attempt_at = unixepoch() + min(900, 5 * (1 << min(attempts, 8))),
      claim_token = NULL, claim_until = NULL
    WHERE id = ? AND claim_token = ? AND sent_at IS NULL
  `)

  return {
    listPosts: () => posts.all(),
    publishPost: (content: string) => publishPost.get(content),
    publishProject(project: ProjectInput) {
      return publishProject.get(project.slug, project.title, project.category, project.logo,
        project.description, project.fullDescription, JSON.stringify(project.features),
        JSON.stringify(project.techStack), JSON.stringify(project.languages), project.type,
        project.link, project.releaseLink, JSON.stringify(project.screenshots))
    },
    listProjects: () => projects.all().map((row) => ({
      ...row,
      features: JSON.parse(String(row.features)),
      techStack: JSON.parse(String(row.techStack)),
      languages: JSON.parse(String(row.languages)),
      screenshots: JSON.parse(String(row.screenshots)),
    })),
    getLikes(id: number, visitor: string, liked?: boolean) {
      const current = likes.get(visitor, id)
      if (!current) return null
      if (liked === undefined) return { count: current.count, liked: Boolean(current.liked) }
      if (liked) addLike.run(id, visitor)
      else removeLike.run(id, visitor)
      const updated = likes.get(visitor, id)!
      return { count: updated.count, liked: Boolean(updated.liked) }
    },
    enqueue(submission: ContactSubmission) {
      if (submission.action === 'subscribe') {
        insertSubmission.run(submission.action, null, submission.contact, null, null)
      } else {
        insertSubmission.run(submission.action, submission.name, submission.contact, submission.type, submission.message)
      }
    },
    claimSubmission: () => claim.get(randomUUID()),
    finishSubmission(id: number, token: string, sent: boolean) {
      return (sent ? complete : retry).run(id, token).changes === 1
    },
  }
}
