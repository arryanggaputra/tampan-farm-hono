import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { jwtVerify } from 'jose'

export interface AuthUser {
  sub: string
  name: string
  email: string
}

type Env = {
  Variables: { user: AuthUser }
  Bindings: CloudflareBindings
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = getCookie(c, 'session')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    c.set('user', payload as unknown as AuthUser)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired session' }, 401)
  }
})
