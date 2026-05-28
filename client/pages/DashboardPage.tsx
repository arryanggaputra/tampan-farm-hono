import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Beef,
  Receipt,
  Banknote,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { dashboardApi } from "../lib/api";
import { formatRupiah } from "../lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30_000,
  });

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

  const grossProfit = data?.gross_profit ?? 0
  const netInvestor = data?.net_profit_investor ?? 0
  const netOperator = data?.net_profit_operator ?? 0

  const stats = [
    {
      title: "Revenue (Lunas)",
      value: formatRupiah(data?.revenue ?? 0),
      icon: PiggyBank,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `Dari ${data?.jumlahTerjual ?? 0} penjualan lunas · harga jual`,
    },
    {
      title: "COGS (Hewan Terjual)",
      value: formatRupiah(data?.cogs ?? 0),
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-50",
      sub: "Harga beli hewan yang sudah terjual",
    },
    {
      title: "Gross Profit",
      value: formatRupiah(Math.abs(grossProfit)),
      icon: grossProfit >= 0 ? TrendingUp : TrendingDown,
      color: grossProfit >= 0 ? "text-emerald-600" : "text-red-600",
      bg: grossProfit >= 0 ? "bg-emerald-50" : "bg-red-50",
      sub: "Revenue − COGS",
      valueColor: grossProfit >= 0 ? "text-emerald-700" : "text-red-700",
    },
    {
      title: "Hewan Tersedia",
      value: `${data?.jumlahHewanTersedia ?? 0} ekor`,
      icon: Beef,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: "Status: Tersedia di kandang",
    },
    {
      title: "Beban Investor",
      value: formatRupiah(data?.expense_investor ?? 0),
      icon: Wallet,
      color: "text-teal-600",
      bg: "bg-teal-50",
      sub: "Total biaya dari kantong investor",
    },
    {
      title: "Beban Operator",
      value: formatRupiah(data?.expense_operator ?? 0),
      icon: Receipt,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: "Total biaya dari kantong operator / peternak",
    },
    {
      title: "Net Profit Investor",
      value: formatRupiah(Math.abs(netInvestor)),
      icon: netInvestor >= 0 ? ShieldCheck : TrendingDown,
      color: netInvestor >= 0 ? "text-green-600" : "text-red-600",
      bg: netInvestor >= 0 ? "bg-green-50" : "bg-red-50",
      sub: "Gross Profit − Beban Investor",
      valueColor: netInvestor >= 0 ? "text-green-700" : "text-red-700",
    },
    {
      title: "Net Profit Operator",
      value: formatRupiah(Math.abs(netOperator)),
      icon: netOperator >= 0 ? ShieldCheck : TrendingDown,
      color: netOperator >= 0 ? "text-violet-600" : "text-red-600",
      bg: netOperator >= 0 ? "bg-violet-50" : "bg-red-50",
      sub: "Gross Profit − Beban Operator",
      valueColor: netOperator >= 0 ? "text-violet-700" : "text-red-700",
    },
    {
      title: "Modal Investor",
      value: formatRupiah(data?.totalInvestorCapital ?? 0),
      icon: Banknote,
      color: "text-teal-600",
      bg: "bg-teal-50",
      sub: "Total harga beli hewan dari dana investor",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan keuangan dan inventaris Peternak Tampan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {stats.map(
          ({ title, value, icon: Icon, color, bg, sub, valueColor }) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{title}</CardTitle>
                  <div className={`rounded-lg p-2 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${valueColor ?? "text-gray-900"}`}>
                  {value}
                </p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card>
        <CardContent className="pt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-green-600" />
            Catatan Penting
          </h2>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li>• <strong>Revenue</strong> = harga jual dari penjualan berstatus <em>lunas</em> saja</li>
            <li>• <strong>COGS</strong> = harga beli hewan yang sudah berstatus terjual</li>
            <li>• <strong>Gross Profit</strong> = Revenue − COGS (selalu dihitung ulang, tidak disimpan)</li>
            <li>• <strong>Beban Investor / Operator</strong> = total porsi biaya per pihak dari tabel biaya operasional</li>
            <li>• <strong>Net Profit Investor</strong> = Gross Profit − Beban Investor</li>
            <li>• <strong>Net Profit Operator</strong> = Gross Profit − Beban Operator</li>
            <li>• Semua angka profit bersifat <em>derived</em> — tidak ada yang disimpan di database</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
