import { useState, FormEvent } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Field } from '../ui/Input'
import { Select } from '../ui/Select'
import { salesApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { todayISO } from '../../lib/utils'
import type { Livestock } from '../../../src/types'

interface Props {
  livestock: Livestock | null
  onClose: () => void
  onSuccess: () => void
}

export function QuickSellDialog({ livestock, onClose, onSuccess }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!livestock) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const sellingPrice = Number(form.get('selling_price'))
    const amountPaid = Number(form.get('amount_paid'))

    try {
      await salesApi.create({
        livestock_id: livestock.id,
        buyer_name: form.get('buyer_name') as string,
        selling_price: sellingPrice,
        amount_paid: amountPaid,
        payment_status: amountPaid >= sellingPrice ? 'lunas' : (form.get('payment_status') as 'dp' | 'lunas'),
        sale_date: form.get('sale_date') as string,
        delivery_date: (form.get('delivery_date') as string) || undefined,
        notes: (form.get('notes') as string) || undefined,
      })
      toast('Penjualan berhasil dicatat!')
      onSuccess()
      onClose()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={!!livestock}
      onClose={onClose}
      title={`Jual: ${livestock?.name ?? livestock?.type ?? ''}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nama Pembeli" required>
          <Input name="buyer_name" placeholder="Bu Sari" required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Harga Jual (Rp)" required>
            <Input
              name="selling_price"
              type="number"
              min="0"
              placeholder="5000000"
              required
            />
          </Field>
          <Field label="Jumlah Dibayar (Rp)" required>
            <Input
              name="amount_paid"
              type="number"
              min="0"
              placeholder="5000000"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status Pembayaran" required>
            <Select name="payment_status" defaultValue="dp" required>
              <option value="dp">DP / Belum Lunas</option>
              <option value="lunas">Lunas</option>
            </Select>
          </Field>
          <Field label="Tanggal Jual" required>
            <Input name="sale_date" type="date" defaultValue={todayISO()} required />
          </Field>
        </div>

        <Field label="Tanggal Kirim (opsional)">
          <Input name="delivery_date" type="date" />
        </Field>

        <Field label="Catatan">
          <Input name="notes" placeholder="Catatan opsional..." />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Catat Penjualan</Button>
        </div>
      </form>
    </Dialog>
  )
}
