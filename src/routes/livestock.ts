import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

type Vars = { user: { sub: string; name: string; email: string } }

const livestock = new Hono<{ Bindings: CloudflareBindings; Variables: Vars }>()

livestock.use('*', authMiddleware)

livestock.get('/', async (c) => {
  const status = c.req.query('status')
  let query = 'SELECT * FROM livestock'
  const params: string[] = []

  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }

  query += ' ORDER BY created_at DESC'

  const result = params.length
    ? await c.env.DB.prepare(query).bind(...params).all()
    : await c.env.DB.prepare(query).all()

  return c.json({ data: result.results })
})

livestock.get('/:id', async (c) => {
  const item = await c.env.DB.prepare('SELECT * FROM livestock WHERE id = ?')
    .bind(c.req.param('id'))
    .first()

  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json({ data: item })
})

livestock.post('/', async (c) => {
  const contentType = c.req.header('content-type') ?? ''

  let name: string | null = null
  let type: string, weightKg: number | null = null, purchasePrice: number
  let purchaseDate: string, vendor: string | null = null
  let notes: string | null = null
  let imageFile: File | null = null

  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.formData()
    name = form.get('name') as string | null
    type = form.get('type') as string
    const wKg = form.get('weight_kg')
    weightKg = wKg ? Number(wKg) : null
    purchasePrice = Number(form.get('purchase_price'))
    purchaseDate = form.get('purchase_date') as string
    vendor = form.get('vendor') as string | null
    notes = form.get('notes') as string | null
    imageFile = form.get('photo') as File | null
  } else {
    const body = await c.req.json<{
      name?: string; type: string; weight_kg?: number; purchase_price: number
      purchase_date: string; vendor?: string; notes?: string
    }>()
    name = body.name ?? null
    type = body.type
    weightKg = body.weight_kg ?? null
    purchasePrice = body.purchase_price
    purchaseDate = body.purchase_date
    vendor = body.vendor ?? null
    notes = body.notes ?? null
  }

  if (!type || !purchasePrice || !purchaseDate) {
    return c.json({ error: 'type, purchase_price, purchase_date are required' }, 400)
  }

  const id = crypto.randomUUID()
  let imageUrl: string | null = null

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const key = `livestock/${id}/${Date.now()}.${ext}`
    await c.env.STORAGE.put(key, imageFile.stream(), {
      httpMetadata: { contentType: imageFile.type },
    })
    imageUrl = `/api/livestock/${id}/photo`
  }

  await c.env.DB.prepare(
    `INSERT INTO livestock (id, name, type, weight_kg, purchase_price, purchase_date, vendor, status, image_url, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`
  ).bind(id, name, type, weightKg, purchasePrice, purchaseDate, vendor, imageUrl, notes).run()

  const item = await c.env.DB.prepare('SELECT * FROM livestock WHERE id = ?').bind(id).first()
  return c.json({ data: item }, 201)
})

livestock.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id FROM livestock WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const body = await c.req.json<Partial<{
    name: string; type: string; weight_kg: number; purchase_price: number
    purchase_date: string; vendor: string; notes: string; status: string
  }>>()

  const fields: string[] = []
  const values: unknown[] = []

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type) }
  if (body.weight_kg !== undefined) { fields.push('weight_kg = ?'); values.push(body.weight_kg) }
  if (body.purchase_price !== undefined) { fields.push('purchase_price = ?'); values.push(body.purchase_price) }
  if (body.purchase_date !== undefined) { fields.push('purchase_date = ?'); values.push(body.purchase_date) }
  if (body.vendor !== undefined) { fields.push('vendor = ?'); values.push(body.vendor) }
  if (body.notes !== undefined) { fields.push('notes = ?'); values.push(body.notes) }
  if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status) }

  if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400)

  fields.push("updated_at = datetime('now')")
  values.push(id)

  await c.env.DB.prepare(
    `UPDATE livestock SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run()

  const item = await c.env.DB.prepare('SELECT * FROM livestock WHERE id = ?').bind(id).first()
  return c.json({ data: item })
})

livestock.patch('/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json<{ status: string }>()

  const valid = ['available', 'sold', 'booking', 'dead']
  if (!valid.includes(status)) {
    return c.json({ error: 'Invalid status' }, 400)
  }

  await c.env.DB.prepare(
    "UPDATE livestock SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(status, id).run()

  const item = await c.env.DB.prepare('SELECT * FROM livestock WHERE id = ?').bind(id).first()
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json({ data: item })
})

livestock.post('/:id/photo', async (c) => {
  const id = c.req.param('id')
  const existing = await c.env.DB.prepare('SELECT id FROM livestock WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const form = await c.req.formData()
  const file = form.get('photo') as File | null
  if (!file || file.size === 0) return c.json({ error: 'No file uploaded' }, 400)

  const ext = file.name.split('.').pop()
  const key = `livestock/${id}/${Date.now()}.${ext}`
  await c.env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  const imageUrl = `/api/livestock/${id}/photo`
  await c.env.DB.prepare(
    "UPDATE livestock SET image_url = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(imageUrl, id).run()

  return c.json({ data: { image_url: imageUrl } })
})

livestock.get('/:id/photo', async (c) => {
  const id = c.req.param('id')
  const list = await c.env.STORAGE.list({ prefix: `livestock/${id}/` })

  if (!list.objects.length) return c.json({ error: 'No photo found' }, 404)

  const latest = list.objects.sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())[0]
  const obj = await c.env.STORAGE.get(latest.key)
  if (!obj) return c.json({ error: 'Photo not found' }, 404)

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})

livestock.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const item = await c.env.DB.prepare('SELECT status FROM livestock WHERE id = ?').bind(id).first<{ status: string }>()
  if (!item) return c.json({ error: 'Not found' }, 404)

  if (item.status !== 'available' && item.status !== 'dead') {
    return c.json({ error: 'Hanya hewan dengan status Tersedia atau Mati yang bisa dihapus' }, 400)
  }

  await c.env.DB.prepare('DELETE FROM livestock WHERE id = ?').bind(id).run()
  return c.json({ data: { ok: true } })
})

export default livestock
