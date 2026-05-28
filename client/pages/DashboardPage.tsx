import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Beef,
  Banknote,
  PiggyBank,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { dashboardApi, bagiHasilApi } from "../lib/api";
import { formatRupiah } from "../lib/utils";
import { Card, CardContent } from "../components/ui/Card";
import type { BagiHasilMemberWithShare } from "../../src/types";

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  valueColor,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
            <p className={`text-xl font-bold mt-1 ${valueColor ?? "text-gray-900"}`}>
              {value}
            </p>
            {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2 shrink-0 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberRow({
  member,
  onEdit,
  onDelete,
}: {
  member: BagiHasilMemberWithShare;
  onEdit: (m: BagiHasilMemberWithShare) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
      </div>
      <span className="text-sm text-gray-500 w-12 text-right shrink-0">{member.percentage}%</span>
      <span className={`text-sm font-semibold w-36 text-right shrink-0 ${member.share_amount >= 0 ? "text-green-700" : "text-red-600"}`}>
        {member.share_amount >= 0 ? "" : "−"}{formatRupiah(Math.abs(member.share_amount))}
      </span>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(member)}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const [editingMember, setEditingMember] = useState<BagiHasilMemberWithShare | null>(null);
  const [editName, setEditName] = useState("");
  const [editPct, setEditPct] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPct, setNewPct] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["dashboard"] });

  const handleStartEdit = (m: BagiHasilMemberWithShare) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditPct(String(m.percentage));
    setAddingNew(false);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      await bagiHasilApi.update(editingMember.id, {
        name: editName,
        percentage: parseInt(editPct, 10),
      });
      setEditingMember(null);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus anggota ini?")) return;
    await bagiHasilApi.delete(id);
    refresh();
  };

  const handleAdd = async () => {
    if (!newName || !newPct) return;
    setSaving(true);
    try {
      await bagiHasilApi.create({ name: newName, percentage: parseInt(newPct, 10) });
      setAddingNew(false);
      setNewName("");
      setNewPct("");
      refresh();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          <p className="text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  const grossProfit = data?.gross_profit ?? 0;
  const netProfit = data?.net_profit_total ?? 0;
  const members = data?.members ?? [];
  const totalPct = members.reduce((s, m) => s + m.percentage, 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan keuangan dan inventaris Peternak Tampan
        </p>
      </div>

      {/* Section 1: Inventaris */}
      <div>
        <SectionHeader label="Inventaris" />
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            title="Hewan Tersedia"
            value={`${data?.jumlahHewanTersedia ?? 0} ekor`}
            sub="Status aktif di kandang"
            icon={Beef}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <KpiCard
            title="Modal Investor"
            value={formatRupiah(data?.totalInvestorCapital ?? 0)}
            sub="Total harga beli hewan dari dana investor"
            icon={Banknote}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
        </div>
      </div>

      {/* Section 2: Keuangan */}
      <div>
        <SectionHeader label="Keuangan" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Pendapatan Penjualan"
            value={formatRupiah(data?.revenue ?? 0)}
            sub={`${data?.jumlahTerjual ?? 0} transaksi lunas`}
            icon={PiggyBank}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <KpiCard
            title="Harga Pokok (HPP)"
            value={formatRupiah(data?.cogs ?? 0)}
            sub="Harga beli hewan yang sudah terjual"
            icon={ShoppingCart}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
          <KpiCard
            title="Laba Kotor"
            value={formatRupiah(Math.abs(grossProfit))}
            sub="Pendapatan − HPP"
            icon={grossProfit >= 0 ? TrendingUp : TrendingDown}
            iconColor={grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}
            iconBg={grossProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}
            valueColor={grossProfit >= 0 ? "text-emerald-700" : "text-red-600"}
          />
        </div>
      </div>

      {/* Section 3: Bagi Hasil */}
      <div>
        <SectionHeader label="Bagi Hasil" />
        <Card>
          <CardContent className="pt-4 pb-4">
            {/* P&L lead-in */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Laba Kotor</span>
                <span className="font-medium text-gray-700">{formatRupiah(grossProfit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">− Beban Operator</span>
                <span className="font-medium text-amber-600">− {formatRupiah(data?.expense_operator ?? 0)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Net Profit</span>
                <span className={`text-lg font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {formatRupiah(Math.abs(netProfit))}
                </span>
              </div>
            </div>

            {/* Members table header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pembagian</span>
                {totalPct !== 100 && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <AlertTriangle size={11} />
                    Total {totalPct}% (harus 100%)
                  </span>
                )}
              </div>
              <button
                onClick={() => { setAddingNew(true); setEditingMember(null); setNewName(""); setNewPct(""); }}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                <Plus size={13} /> Tambah
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {members.map((m) =>
                editingMember?.id === m.id ? (
                  <div key={m.id} className="flex items-center gap-2 py-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Nama"
                    />
                    <input
                      value={editPct}
                      onChange={(e) => setEditPct(e.target.value)}
                      type="number"
                      min="0"
                      max="100"
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="%"
                    />
                    <button onClick={handleSaveEdit} disabled={saving} className="rounded p-1 text-green-600 hover:bg-green-50">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingMember(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <MemberRow key={m.id} member={m} onEdit={handleStartEdit} onDelete={handleDelete} />
                )
              )}

              {addingNew && (
                <div className="flex items-center gap-2 py-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Nama"
                    autoFocus
                  />
                  <input
                    value={newPct}
                    onChange={(e) => setNewPct(e.target.value)}
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="%"
                  />
                  <button onClick={handleAdd} disabled={saving} className="rounded p-1 text-green-600 hover:bg-green-50">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setAddingNew(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Beban Investor note */}
            {(data?.expense_investor ?? 0) > 0 && (
              <p className="mt-4 text-[11px] text-gray-400">
                Beban Investor ({formatRupiah(data?.expense_investor ?? 0)}) tidak dikurangi dari pool — ditanggung investor di luar bagi hasil.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
