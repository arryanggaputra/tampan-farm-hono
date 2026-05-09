import { useState, FormEvent, useEffect } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Field } from '../ui/Input'
import { Select } from '../ui/Select'
import { salesApi, livestockApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { todayISO, formatRupiah } from '../../lib/utils'
import type { Livestock, Sale } from '../../../src/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing?: Sale | null
}

export function SaleForm({ open, onClose, onSuccess, editing }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [livestock, setLivestock] = useState<Livestock[]>([])

  useEffect(() => {
    if (open && !editing) {
      livestockApi.list().then((r) => {
        setLivestock(r.data.filter((a) => a.status === 'available' || a.status === 'booking'))
      })
    }
  }, [open, editing])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const sellingPrice = Number(form.get('selling_price'))
    const amountPaid = Number(form.get('amount_paid'))

    try {
      if (editing) {
        await salesApi.update(editing.id, {
          buyer_name: form.get('buyer_name') as string,
          selling_price: sellingPrice,
          amount_paid: amountPaid,
          payment_status: amountPaid >= sellingPrice ? 'lunas' : (form.get('payment_status') as 'dp' | 'lunas'),
          sale_date: form.get('sale_date') as string,
          delivery_date: (form.get('delivery_date') as string) || undefined,
          notes: (form.get('notes') as string) || undefined,
        })
        toast('Penjualan berhasil diupdate')
      } else {
        await salesApi.create({
          livestock_id: form.get('livestock_id') as string,
          buyer_name: form.get('buyer_name') as string,
          selling_price: sellingPrice,
          amount_paid: amountPaid,
          payment_status: amountPaid >= sellingPrice ? 'lunas' : (form.get('payment_status') as 'dp' | 'lunas'),
          sale_date: form.get('sale_date') as string,
          delivery_date: (form.get('delivery_date') as string) || undefined,
          notes: (form.get('notes') as string) || undefined,
        })
        toast('Penjualan berhasil dicatat!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit Penjualan' : 'Tambah Penjualan'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!editing && (
          <Field label="Hewan" required>
            <Select name="livestock_id" required>
              <option value="">-- Pilih Hewan --</option>
              {livestock.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name ? `${a.name} (${a.type})` : a.type}
                  {a.weight_kg ? ` — ${a.weight_kg}kg` : ''}
                  {` — ${formatRupiah(a.purchase_price)}`}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Nama Pembeli" required>
          <Input name="buyer_name" defaultValue={editing?.buyer_name ?? ''} placeholder="Bu Sari" required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Harga Jual (Rp)" required>
            <Input
              name="selling_price"
              type="number"
              min="0"
              defaultValue={editing?.selling_price ?? ''}
              placeholder="5000000"
              required
            />
          </Field>
          <Field label="Jumlah Dibayar (Rp)" required>
            <Input
              name="amount_paid"
              type="number"
              min="0"
              defaultValue={editing?.amount_paid ?? ''}
              placeholder="5000000"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status Pembayaran">
            <Select name="payment_status" defaultValue={editing?.payment_status ?? 'dp'}>
              <option value="dp">DP / Belum Lunas</option>
              <option value="lunas">Lunas</option>
            </Select>
          </Field>
          <Field label="Tanggal Jual" required>
            <Input name="sale_date" type="date" defaultValue={editing?.sale_date ?? todayISO()} required />
          </Field>
        </div>

        <Field label="Tanggal Kirim (opsional)">
          <Input name="delivery_date" type="date" defaultValue={editing?.delivery_date ?? ''} />
        </Field>

        <Field label="Catatan">
          <Input name="notes" defaultValue={editing?.notes ?? ''} placeholder="Catatan opsional..." />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            {editing ? 'Simpan' : 'Catat Penjualan'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
