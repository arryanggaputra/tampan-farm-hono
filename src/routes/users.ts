import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { hashPassword } from '../lib/password'

type Variables = { user: { sub: string; name: string; email: string } }

const users = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>()

users.use('*', authMiddleware)

users.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT id, name, email, created_at FROM users ORDER BY created_at ASC'
  ).all<{ id: string; name: string; email: string; created_at: string }>()

  return c.json({ data: result.results })
})

users.post('/', async (c) => {
  const { name, email, password } = await c.req.json<{
    name: string; email: string; password: string
  }>()

  if (!name || !email || !password) {
    return c.json({ error: 'name, email, dan password wajib diisi' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password minimal 8 karakter' }, 400)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first()
  if (existing) {
    return c.json({ error: 'Email sudah terdaftar' }, 400)
  }

  const id = crypto.randomUUID()
  const hash = await hashPassword(password)

  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, name.trim(), email.toLowerCase().trim(), hash).run()

  return c.json({ data: { id, name: name.trim(), email: email.toLowerCase().trim() } }, 201)
})

users.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const currentUserId = c.get('user').sub

  if (id === currentUserId) {
    return c.json({ error: 'Tidak bisa menghapus akun sendiri' }, 400)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE id = ?'
  ).bind(id).first()
  if (!existing) return c.json({ error: 'User tidak ditemukan' }, 404)

  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
  return c.json({ data: { ok: true } })
})

export default users
