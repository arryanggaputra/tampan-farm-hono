import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { SignJWT } from 'jose'
import { verifyPassword, hashPassword } from '../lib/password'
import { authMiddleware } from '../middleware/auth'

type Bindings = CloudflareBindings
type Variables = { user: { sub: string; name: string; email: string } }

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, password_hash FROM users WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first<{
    id: string; email: string; name: string; password_hash: string
  }>()

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Email atau password salah' }, 401)
  }

  const secret = new TextEncoder().encode(c.env.JWT_SECRET)
  const token = await new SignJWT({ sub: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return c.json({ data: { id: user.id, name: user.name, email: user.email } })
})

auth.post('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ data: { ok: true } })
})

auth.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ data: { id: user.sub, name: user.name, email: user.email } })
})

auth.post('/change-password', authMiddleware, async (c) => {
  const { currentPassword, newPassword } = await c.req.json<{
    currentPassword: string
    newPassword: string
  }>()

  const userId = c.get('user').sub
  const row = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?'
  ).bind(userId).first<{ password_hash: string }>()

  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    return c.json({ error: 'Password lama tidak sesuai' }, 400)
  }

  if (!newPassword || newPassword.length < 8) {
    return c.json({ error: 'Password baru minimal 8 karakter' }, 400)
  }

  const newHash = await hashPassword(newPassword)
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ? WHERE id = ?'
  ).bind(newHash, userId).run()

  return c.json({ data: { ok: true } })
})

export default auth
