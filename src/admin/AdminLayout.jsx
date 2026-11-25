import {
  BarChart3,
  CalendarCheck2,
  CarFront,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Repeat,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

export function AdminLayout({
  activeTab,
  onTabChange,
  user,
  business,
  badges,
  onLogout,
  onViewPublic,
  children,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS & Billing', icon: Receipt },
    { id: 'invoices', label: 'Invoices & Payments', icon: FileText },
    { id: 'reports', label: 'Profit & Reports', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory & Cost', icon: CarFront },
    { id: 'inquiries', label: 'VIP Leads', icon: CalendarCheck2, badge: badges?.newInquiries || 0 },
    { id: 'exchanges', label: 'Trade-Ins', icon: Repeat, badge: badges?.newExchanges || 0 },
    { id: 'customers', label: 'Reviews & Photos', icon: Users, badge: badges?.pendingReviews || 0 },
    { id: 'security', label: 'Security & Backups', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EF]">
      <header className="no-print sticky top-0 z-30 border-b border-[#D4AF37]/25 bg-[#05070B] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="./images/sithumsa-logo.jpg"
              alt="Sithumsa Enterprises"
              className="h-9 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-white/15 pl-3">
              <div className="font-serif-lux text-sm font-bold text-white">
                {business?.business_name || 'Sithumsa Enterprise'} — Executive POS
              </div>
              <div className="text-[11px] text-slate-400">
                Signed in as <span className="font-semibold text-[#E5C158]">{user?.username}</span>
                {user?.twoFactorEnabled && (
                  <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    2FA Active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewPublic}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#E5C158]" />
              Public Showroom
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1.5 pb-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {item.badge > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? 'bg-slate-950 text-[#E5C158]' : 'bg-red-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
