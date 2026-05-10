import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const dashboard = new Hono<{ Bindings: CloudflareBindings; Variables: { user: { sub: string; name: string; email: string } } }>()

dashboard.get('/', authMiddleware, async (c) => {
  const [modalResult, penjualanResult, biayaResult, hewanResult, keuntunganResult] = await Promise.all([
    c.env.DB.prepare('SELECT COALESCE(SUM(purchase_price), 0) AS total FROM livestock').first<{ total: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(amount_paid), 0) AS total FROM sales').first<{ total: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(cost), 0) AS total FROM expenses').first<{ total: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM livestock WHERE status = 'available'").first<{ count: number }>(),
    c.env.DB.prepare(`
      SELECT
        COALESCE(SUM(s.selling_price - l.purchase_price), 0) AS keuntungan_kotor,
        COUNT(*) AS jumlah_terjual
      FROM sales s
      JOIN livestock l ON l.id = s.livestock_id
    `).first<{ keuntungan_kotor: number; jumlah_terjual: number }>(),
  ])

  const totalModalKeluar = (modalResult?.total ?? 0) + (biayaResult?.total ?? 0)
  const totalPenjualan = penjualanResult?.total ?? 0
  const totalBiayaOperasional = biayaResult?.total ?? 0
  const profitLoss = totalPenjualan - totalModalKeluar

  return c.json({
    data: {
      totalModalKeluar,
      totalPenjualan,
      profitLoss,
      jumlahHewanTersedia: hewanResult?.count ?? 0,
      totalBiayaOperasional,
      keuntunganKotorTerjual: keuntunganResult?.keuntungan_kotor ?? 0,
      jumlahTerjual: keuntunganResult?.jumlah_terjual ?? 0,
    }
  })
})

export default dashboard
