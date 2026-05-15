import { useState, FormEvent } from 'react'

async function resizeImage(file: File, maxPx = 600, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.src = url
  })
}
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input, Field } from '../ui/Input'
import { Select } from '../ui/Select'
import { livestockApi } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { todayISO } from '../../lib/utils'
import type { Livestock } from '../../../src/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editing?: Livestock | null
}

export function LivestockForm({ open, onClose, onSuccess, editing }: Props) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      if (editing) {
        const body: Record<string, unknown> = {
          name: form.get('name') || null,
          type: form.get('type'),
          weight_kg: form.get('weight_kg') ? Number(form.get('weight_kg')) : null,
          purchase_price: Number(form.get('purchase_price')),
          selling_price: form.get('selling_price') ? Number(form.get('selling_price')) : null,
          purchase_date: form.get('purchase_date'),
          vendor: form.get('vendor') || null,
          notes: form.get('notes') || null,
        }
        await livestockApi.update(editing.id, body as Partial<Livestock>)
        const photoFile = form.get('photo') as File
        if (photoFile?.size > 0) {
          const resized = await resizeImage(photoFile)
          const pf = new FormData()
          pf.append('photo', resized)
          await livestockApi.uploadPhoto(editing.id, pf)
        }
        toast('Hewan berhasil diupdate')
      } else {
        const rawPhoto = form.get('photo') as File
        if (rawPhoto?.size > 0) {
          form.set('photo', await resizeImage(rawPhoto))
        }
        await livestockApi.create(form)
        toast('Hewan berhasil ditambahkan')
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
    <Dialog open={open} onClose={onClose} title={editing ? 'Edit Hewan' : 'Tambah Hewan Baru'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Hewan">
            <Input name="name" defaultValue={editing?.name ?? ''} placeholder="cth: Si Doni" />
          </Field>
          <Field label="Jenis" required>
            <Select name="type" defaultValue={editing?.type ?? 'Morino'} required>
              <option value="Morino">Morino</option>
              <option value="Texel">Texel</option>
              <option value="Jawa">Jawa</option>
              <option value="Lainnya">Lainnya</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Berat (kg)">
            <Input
              name="weight_kg"
              type="number"
              step="0.1"
              min="0"
              defaultValue={editing?.weight_kg ?? ''}
              placeholder="45"
            />
          </Field>
          <Field label="Harga Beli (Rp)" required>
            <Input
              name="purchase_price"
              type="number"
              min="0"
              defaultValue={editing?.purchase_price ?? ''}
              placeholder="3500000"
              required
            />
          </Field>
        </div>

        <Field label="Harga Jual (Rp)">
          <Input
            name="selling_price"
            type="number"
            min="0"
            defaultValue={editing?.selling_price ?? ''}
            placeholder="5000000"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal Beli" required>
            <Input
              name="purchase_date"
              type="date"
              defaultValue={editing?.purchase_date ?? todayISO()}
              required
            />
          </Field>
          <Field label="Vendor / Asal">
            <Input name="vendor" defaultValue={editing?.vendor ?? ''} placeholder="Pak Budi" />
          </Field>
        </div>

        <Field label="Foto Hewan">
          <input
            name="photo"
            type="file"
            accept="image/*,video/*"
            className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-green-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-green-700"
          />
          {editing?.image_url && (
            <img src={editing.image_url} alt="Foto hewan" className="mt-2 h-24 w-24 rounded-lg object-cover" />
          )}
        </Field>

        <Field label="Catatan">
          <textarea
            name="notes"
            defaultValue={editing?.notes ?? ''}
            rows={2}
            placeholder="Catatan tambahan..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            {editing ? 'Simpan Perubahan' : 'Tambah Hewan'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
