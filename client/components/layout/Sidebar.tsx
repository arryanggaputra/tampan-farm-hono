import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Beef, ShoppingCart, Receipt, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/livestock', icon: Beef, label: 'Inventaris Hewan' },
  { to: '/admin/sales', icon: ShoppingCart, label: 'Penjualan' },
  { to: '/admin/expenses', icon: Receipt, label: 'Biaya Operasional' },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { logout } = useAuth()

  return (
    <div className="flex h-full flex-col bg-green-700 text-white">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-green-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Beef className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Tampan Farm</p>
          <p className="text-xs text-green-200 mt-0.5">Ops Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-green-100 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-green-600">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-green-100 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  )
}
