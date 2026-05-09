import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { salesApi } from "../lib/api";
import { Button } from "../components/ui/Button";
import { SalesTable } from "../components/sales/SalesTable";
import { SaleForm } from "../components/sales/SaleForm";
import type { Sale } from "../../src/types";

export function SalesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: () => salesApi.list().then((r) => r.data),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["sales"] });
    qc.invalidateQueries({ queryKey: ["livestock"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Penjualan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Riwayat transaksi penjualan hewan
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
          <span className="sm:inline">Tambah Penjualan</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : (
        <SalesTable
          data={data ?? []}
          onEdit={(item) => {
            setEditing(item);
            setShowForm(true);
          }}
          onRefresh={refresh}
        />
      )}

      <SaleForm
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
