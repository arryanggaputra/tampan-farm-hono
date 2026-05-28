import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { expensesApi } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { useToast } from "../components/ui/Toast";
import { formatRupiah, formatDate } from "../lib/utils";
import type { Expense, ExpenseCategory } from "../../src/types";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; variant: "green" | "yellow" | "blue" | "red" | "default" }
> = {
  kandang: { label: "Kandang", variant: "blue" },
  pakan: { label: "Pakan", variant: "green" },
  obat: { label: "Obat", variant: "red" },
  upah: { label: "Upah", variant: "yellow" },
  infrastruktur: { label: "Infrastruktur", variant: "blue" },
  kesehatan: { label: "Kesehatan", variant: "red" },
  operasional: { label: "Operasional", variant: "yellow" },
  lainnya: { label: "Lainnya", variant: "default" },
};

const FALLBACK_CONFIG = { label: "Lainnya", variant: "default" as const };

export function ExpensesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => expensesApi.list().then((r) => r.data),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["expenses"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`Hapus biaya "${expense.description}"?`)) return;
    try {
      await expensesApi.delete(expense.id);
      toast("Biaya berhasil dihapus");
      refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const totalBiaya = data?.reduce((sum, e) => sum + e.cost, 0) ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Biaya Operasional</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pengeluaran non-hewan (kandang, pakan, obat, upah)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Tambah Biaya</span>
        </Button>
      </div>

      {/* Total */}
      {data && data.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <span className="text-amber-700">Total Biaya Operasional: </span>
          <span className="font-bold text-amber-800">
            {formatRupiah(totalBiaya)}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-sm">Belum ada data pengeluaran</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map((expense) => {
            const cat =
              CATEGORY_CONFIG[expense.category.toLowerCase()] ??
              FALLBACK_CONFIG;
            return (
              <div
                key={expense.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Badge variant={cat.variant}>{cat.label}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(expense.expense_date)}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-sm font-bold text-gray-900">
                    {formatRupiah(expense.cost)}
                  </p>
                  <p className="text-[10px] text-teal-600">
                    Inv {formatRupiah(expense.share_investor_amount)} · Op {formatRupiah(expense.share_operator_amount)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(expense);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExpenseForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSuccess={refresh}
        editing={editing}
      />
    </div>
  );
}
