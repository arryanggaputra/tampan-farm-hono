import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import livestockRoutes from './routes/livestock'
import salesRoutes from './routes/sales'
import expensesRoutes from './routes/expenses'
import dashboardRoutes from './routes/dashboard'
import usersRoutes from './routes/users'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('/api/*', cors({ origin: '*', credentials: true }))

app.route('/api/auth', authRoutes)
app.route('/api/livestock', livestockRoutes)
app.route('/api/sales', salesRoutes)
app.route('/api/expenses', expensesRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/users', usersRoutes)

// SPA fallback — serve index.html for all non-API routes so React Router handles client-side navigation
app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
