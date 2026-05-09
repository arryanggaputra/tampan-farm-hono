import { useState, FormEvent, useRef } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Field } from '../ui/Input'
import { Select } from '../ui/Select'
import { expensesApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { todayISO } from '../../lib/utils'
import { X, ImageIcon } from 'lucide-react'
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setRemovePhoto(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setRemovePhoto(true)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickPhoto = (url: string) => {
    window.open(url, '_blank')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      if (editing) {
        const body: Record<string, unknown> = {
          category: form.get('category'),
          description: form.get('description'),
          cost: Number(form.get('cost')),
          expense_date: form.get('expense_date'),
        }
        if (removePhoto) {
          body.image_url = null
        }
        await expensesApi.update(editing.id, body as Partial<Expense>)
        const photoFile = form.get('photo') as File
        if (photoFile?.size > 0) {
          const pf = new FormData()
          pf.append('photo', photoFile)
          await expensesApi.uploadPhoto(editing.id, pf)
        }
        toast('Biaya berhasil diupdate')
      } else {
        await expensesApi.create(form)
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

        <Field label="Foto Bukti">
          <input
            ref={fileInputRef}
            name="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-green-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-green-700"
          />
          
          {/* Preview for new photo */}
          {photoPreview && (
            <div className="relative mt-2 inline-block">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="h-24 w-24 rounded-lg object-cover cursor-pointer hover:opacity-90"
                onClick={() => handleClickPhoto(photoPreview)}
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Existing photo (when editing) */}
          {editing?.image_url && !photoPreview && !removePhoto && (
            <div className="relative mt-2 inline-block">
              <img 
                src={editing.image_url} 
                alt="Foto bukti" 
                className="h-24 w-24 rounded-lg object-cover cursor-pointer hover:opacity-90 border-2 border-gray-200"
                onClick={() => handleClickPhoto(editing.image_url!)}
                title="Klik untuk melihat ukuran penuh"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Hapus foto"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Removed photo indicator */}
          {removePhoto && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <ImageIcon size={16} />
              <span>Foto akan dihapus</span>
              <button
                type="button"
                onClick={() => setRemovePhoto(false)}
                className="text-green-600 hover:underline text-xs"
              >
                Batalkan
              </button>
            </div>
          )}
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
