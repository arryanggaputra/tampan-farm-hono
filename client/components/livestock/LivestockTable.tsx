import { useState } from 'react'
import { Pencil, ShoppingCart, MoreHorizontal, Trash2, Image } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { formatRupiah, formatDate } from '../../lib/utils'
import { livestockApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import type { Livestock, LivestockStatus } from '../../../src/types'

interface Props {
  data: Livestock[]
  onEdit: (item: Livestock) => void
  onSell: (item: Livestock) => void
  onRefresh: () => void
}

export function LivestockTable({ data, onEdit, onSell, onRefresh }: Props) {
  const toast = useToast()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, status: LivestockStatus) => {
    setUpdatingId(id)
    try {
      await livestockApi.updateStatus(id, status)
      toast('Status berhasil diupdate')
      onRefresh()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (item: Livestock) => {
    if (!confirm(`Hapus hewan "${item.name ?? item.type}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      await livestockApi.delete(item.id)
      toast('Hewan berhasil dihapus')
      onRefresh()
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Image className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Belum ada data hewan</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Foto</th>
            <th className="px-4 py-3">Nama / Jenis</th>
            <th className="px-4 py-3">BB (kg)</th>
            <th className="px-4 py-3">Harga Beli</th>
            <th className="px-4 py-3">Tgl. Beli</th>
            <th className="px-4 py-3">Vendor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name ?? item.type}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{item.name ?? '-'}</p>
                <p className="text-xs text-gray-400">{item.type}</p>
              </td>
              <td className="px-4 py-3 text-gray-600">{item.weight_kg ?? '-'}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{formatRupiah(item.purchase_price)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(item.purchase_date)}</td>
              <td className="px-4 py-3 text-gray-600">{item.vendor ?? '-'}</td>
              <td className="px-4 py-3">
                <Select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as LivestockStatus)}
                  disabled={updatingId === item.id || item.status === 'sold'}
                  className="w-32 text-xs h-7"
                >
                  <option value="available">Tersedia</option>
                  <option value="booking">Booking/DP</option>
                  <option value="sold">Terjual</option>
                  <option value="dead">Mati</option>
                </Select>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {item.status !== 'sold' && item.status !== 'dead' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSell(item)}
                      title="Jual"
                      className="text-green-600 hover:text-green-700"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item)}
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
