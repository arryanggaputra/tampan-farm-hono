import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const dashboard = new Hono<{ Bindings: CloudflareBindings; Variables: { user: { sub: string; name: string; email: string } } }>()

dashboard.get('/', authMiddleware, async (c) => {
  const [revenueResult, cogsResult, expensesResult, hewanResult, jumlahTerjualResult, investorCapitalResult] = await Promise.all([
    c.env.DB.prepare("SELECT COALESCE(SUM(selling_price), 0) AS total FROM sales WHERE payment_status = 'lunas'").first<{ total: number }>(),
    c.env.DB.prepare("SELECT COALESCE(SUM(purchase_price), 0) AS total FROM livestock WHERE status = 'sold'").first<{ total: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(share_investor_amount), 0) AS investor_expense, COALESCE(SUM(share_operator_amount), 0) AS operator_expense FROM expenses').first<{ investor_expense: number; operator_expense: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM livestock WHERE status = 'available'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM sales").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COALESCE(SUM(purchase_price), 0) AS total FROM livestock WHERE source_of_funds = 'INVESTOR_CASH'").first<{ total: number }>(),
  ])

  const revenue = revenueResult?.total ?? 0
  const cogs = cogsResult?.total ?? 0
  const grossProfit = revenue - cogs
  const expenseInvestor = expensesResult?.investor_expense ?? 0
  const expenseOperator = expensesResult?.operator_expense ?? 0

  return c.json({
    data: {
      revenue,
      cogs,
      gross_profit: grossProfit,
      expense_investor: expenseInvestor,
      expense_operator: expenseOperator,
      net_profit_investor: grossProfit - expenseInvestor,
      net_profit_operator: grossProfit - expenseOperator,
      jumlahHewanTersedia: hewanResult?.count ?? 0,
      jumlahTerjual: jumlahTerjualResult?.count ?? 0,
      totalInvestorCapital: investorCapitalResult?.total ?? 0,
    }
  })
})

export default dashboard
