import { useState } from "react";
import {
  Pencil,
  ShoppingCart,
  MoreHorizontal,
  Trash2,
  Image,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { formatRupiah, formatDate } from "../../lib/utils";
import { livestockApi } from "../../lib/api";
import { useToast } from "../ui/Toast";
import type { Livestock, LivestockStatus } from "../../../src/types";

interface Props {
  data: Livestock[];
  onEdit: (item: Livestock) => void;
  onSell: (item: Livestock) => void;
  onRefresh: () => void;
}

export function LivestockTable({ data, onEdit, onSell, onRefresh }: Props) {
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: LivestockStatus) => {
    setUpdatingId(id);
    try {
      await livestockApi.updateStatus(id, status);
      toast("Status berhasil diupdate");
      onRefresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item: Livestock) => {
    if (
      !confirm(
        `Hapus hewan "${
          item.name ?? item.type
        }"? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;
    try {
      await livestockApi.delete(item.id);
      toast("Hewan berhasil dihapus");
      onRefresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Image className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Belum ada data hewan</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
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
                  <p className="font-medium text-gray-900">
                    {item.name ?? "-"}
                  </p>
                  <p className="text-xs text-gray-400">{item.type}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.weight_kg ?? "-"}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatRupiah(item.purchase_price)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(item.purchase_date)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.vendor ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.id,
                        e.target.value as LivestockStatus
                      )
                    }
                    disabled={updatingId === item.id || item.status === "sold"}
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
                    {item.status !== "sold" && item.status !== "dead" && (
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
          >
            <div className="flex gap-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name ?? item.type}
                  className="h-16 w-16 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Image className="h-6 w-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.name ?? "-"}
                </p>
                <p className="text-xs text-gray-400">{item.type}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {formatRupiah(item.purchase_price)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">BB:</span>
                <span className="ml-1 text-gray-600">
                  {item.weight_kg ?? "-"} kg
                </span>
              </div>
              <div>
                <span className="text-gray-400">Vendor:</span>
                <span className="ml-1 text-gray-600">{item.vendor ?? "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Tgl Beli:</span>
                <span className="ml-1 text-gray-600">
                  {formatDate(item.purchase_date)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={item.status}
                onChange={(e) =>
                  handleStatusChange(item.id, e.target.value as LivestockStatus)
                }
                disabled={updatingId === item.id || item.status === "sold"}
                className="flex-1 text-xs h-8"
              >
                <option value="available">Tersedia</option>
                <option value="booking">Booking/DP</option>
                <option value="sold">Terjual</option>
                <option value="dead">Mati</option>
              </Select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="flex-1"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              {item.status !== "sold" && item.status !== "dead" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSell(item)}
                  className="flex-1 text-green-600 hover:text-green-700"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Jual
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item)}
                title="Hapus"
                className="text-red-500 hover:text-red-600 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
