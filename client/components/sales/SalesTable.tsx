import { Pencil, Trash2, FileText } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { salesApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { generateReceipt } from '../../lib/pdf'
import { formatRupiah, formatDate } from '../../lib/utils'
import type { Sale } from '../../../src/types'

interface Props {
  data: Sale[]
  onEdit: (item: Sale) => void
  onRefresh: () => void
}

export function SalesTable({ data, onEdit, onRefresh }: Props) {
  const toast = useToast()

  const handleDelete = async (sale: Sale) => {
    if (!confirm(`Hapus transaksi untuk ${sale.buyer_name}? Status hewan akan dikembalikan ke Tersedia.`)) return
    try {
      await salesApi.delete(sale.id)
      toast('Transaksi berhasil dihapus')
      onRefresh()
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  const handleReceipt = async (sale: Sale) => {
    try {
      const res = await fetch(`/api/sales/${sale.id}`, { credentials: 'include' })
      const { data } = await res.json<{ data: Sale & { livestock_weight_kg?: number } }>()
      generateReceipt(data)
    } catch {
      generateReceipt(sale)
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Belum ada data penjualan</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Hewan</th>
            <th className="px-4 py-3">Pembeli</th>
            <th className="px-4 py-3">Harga Jual</th>
            <th className="px-4 py-3">Dibayar</th>
            <th className="px-4 py-3">Sisa</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Tgl Jual</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">
                  {sale.livestock_name ?? '-'}
                </p>
                <p className="text-xs text-gray-400">{sale.livestock_type}</p>
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{sale.buyer_name}</td>
              <td className="px-4 py-3 font-medium">{formatRupiah(sale.selling_price)}</td>
              <td className="px-4 py-3 text-green-700 font-medium">{formatRupiah(sale.amount_paid)}</td>
              <td className="px-4 py-3">
                {sale.selling_price - sale.amount_paid > 0
                  ? <span className="text-red-600 font-medium">{formatRupiah(sale.selling_price - sale.amount_paid)}</span>
                  : <span className="text-gray-400">-</span>
                }
              </td>
              <td className="px-4 py-3">
                <Badge variant={sale.payment_status === 'lunas' ? 'green' : 'yellow'}>
                  {sale.payment_status === 'lunas' ? 'Lunas' : 'DP'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-600">{formatDate(sale.sale_date)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReceipt(sale)}
                    title="Print Kwitansi"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(sale)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sale)}
                    title="Hapus"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
