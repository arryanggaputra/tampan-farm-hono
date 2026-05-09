import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Beef, Receipt } from 'lucide-react'
import { dashboardApi } from '../lib/api'
import { formatRupiah } from '../lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <p className="text-sm">Memuat data...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Modal Keluar',
      value: formatRupiah(data?.totalModalKeluar ?? 0),
      icon: Wallet,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      sub: `Termasuk biaya operasional ${formatRupiah(data?.totalBiayaOperasional ?? 0)}`,
    },
    {
      title: 'Total Penjualan',
      value: formatRupiah(data?.totalPenjualan ?? 0),
      icon: PiggyBank,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: 'Akumulasi pembayaran diterima',
    },
    {
      title: 'Profit / Loss Estimasi',
      value: formatRupiah(Math.abs(data?.profitLoss ?? 0)),
      icon: (data?.profitLoss ?? 0) >= 0 ? TrendingUp : TrendingDown,
      color: (data?.profitLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bg: (data?.profitLoss ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
      sub: (data?.profitLoss ?? 0) >= 0 ? 'Profit' : 'Rugi',
      valueColor: (data?.profitLoss ?? 0) >= 0 ? 'text-green-700' : 'text-red-700',
    },
    {
      title: 'Hewan Tersedia',
      value: `${data?.jumlahHewanTersedia ?? 0} ekor`,
      icon: Beef,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: 'Status: Tersedia di kandang',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan keuangan dan inventaris Tampan Farm</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color, bg, sub, valueColor }) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className={`rounded-lg p-2 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${valueColor ?? 'text-gray-900'}`}>{value}</p>
              <p className="mt-1 text-xs text-gray-400">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick tips */}
      <Card>
        <CardContent className="pt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-green-600" />
            Catatan Penting
          </h2>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li>• Profit/loss dihitung dari: Penjualan − Modal Hewan − Biaya Operasional</li>
            <li>• Hanya pembayaran yang sudah diterima (DP + Lunas) yang masuk total penjualan</li>
            <li>• Gunakan tab <strong>Inventaris</strong> untuk menambah atau menjual hewan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
