import { useState, FormEvent } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Field } from '../ui/Input'
import { Select } from '../ui/Select'
import { expensesApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { todayISO } from '../../lib/utils'
import type { Expense, ExpenseCategory } from '../../../src/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing?: Expense | null
}

export function ExpenseForm({ open, onClose, onSuccess, editing }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const data = {
      category: form.get('category') as ExpenseCategory,
      description: form.get('description') as string,
      cost: Number(form.get('cost')),
      expense_date: form.get('expense_date') as string,
    }

    try {
      if (editing) {
        await expensesApi.update(editing.id, data)
        toast('Biaya berhasil diupdate')
      } else {
        await expensesApi.create(data)
        toast('Biaya berhasil dicatat')
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
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit Biaya' : 'Tambah Biaya Operasional'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kategori" required>
            <Select name="category" defaultValue={editing?.category ?? 'pakan'} required>
              <option value="kandang">Kandang</option>
              <option value="pakan">Pakan / Konsentrat</option>
              <option value="obat">Obat-obatan</option>
              <option value="upah">Upah Tim</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </Field>
          <Field label="Biaya (Rp)" required>
            <Input
              name="cost"
              type="number"
              min="0"
              defaultValue={editing?.cost ?? ''}
              placeholder="500000"
              required
            />
          </Field>
        </div>

        <Field label="Deskripsi" required>
          <Input
            name="description"
            defaultValue={editing?.description ?? ''}
            placeholder="cth: Beli konsentrat 50kg"
            required
          />
        </Field>

        <Field label="Tanggal" required>
          <Input name="expense_date" type="date" defaultValue={editing?.expense_date ?? todayISO()} required />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            {editing ? 'Simpan' : 'Tambah Biaya'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
