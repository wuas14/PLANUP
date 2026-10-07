"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/dashboard/tasks", label: "Taches", icon: "📋" },
  { href: "/dashboard/calendar", label: "Calendrier", icon: "📅" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isOnline = useOnlineStatus();

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "260px",
        height: "100vh",
        zIndex: 40,
      }}
      className="bg-slate-900 border-r border-slate-800 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-indigo-400 tracking-tight">
          Plan<span className="text-white">Up</span>
        </h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="text-xs text-slate-400">
              {isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Utilisateur */}
      {user && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName || "Utilisateur"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-all"
          >
            Se deconnecter
          </button>
        </div>
      )}
    </aside>
  );
}