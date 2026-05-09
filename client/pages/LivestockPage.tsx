import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { livestockApi } from "../lib/api";
import { Button } from "../components/ui/Button";
import { LivestockTable } from "../components/livestock/LivestockTable";
import { LivestockForm } from "../components/livestock/LivestockForm";
import { QuickSellDialog } from "../components/livestock/QuickSellDialog";
import type { Livestock, LivestockStatus } from "../../src/types";

const TABS: { label: string; value: LivestockStatus | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "Tersedia", value: "available" },
  { label: "Booking", value: "booking" },
  { label: "Terjual", value: "sold" },
  { label: "Mati", value: "dead" },
];

export function LivestockPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<LivestockStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Livestock | null>(null);
  const [selling, setSelling] = useState<Livestock | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["livestock", tab],
    queryFn: () =>
      livestockApi.list(tab === "all" ? undefined : tab).then((r) => r.data),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["livestock"] });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventaris Hewan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola semua hewan di kandang
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
          <span className="sm:inline">Tambah Hewan</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit min-w-full sm:min-w-0">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                tab === value
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : (
        <LivestockTable
          data={data ?? []}
          onEdit={(item) => {
            setEditing(item);
            setShowForm(true);
          }}
          onSell={setSelling}
          onRefresh={refresh}
        />
      )}

      <LivestockForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSuccess={refresh}
        editing={editing}
      />

      <QuickSellDialog
        livestock={selling}
        onClose={() => setSelling(null)}
        onSuccess={() => {
          refresh();
          qc.invalidateQueries({ queryKey: ["sales"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />
    </div>
  );
}
