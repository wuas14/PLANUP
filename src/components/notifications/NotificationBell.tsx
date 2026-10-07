"use client";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function NotificationBell() {
  const { isGranted, isDenied, requestPermission } = useNotifications();

  if (isGranted) return null;

  return (
    <button
      onClick={requestPermission}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
        isDenied
          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20"
      }`}
      title={isDenied ? "Notifications bloquees dans votre navigateur" : "Activer les notifications"}
    >
      <span>🔔</span>
      <span>{isDenied ? "Notifs bloquees" : "Activer rappels"}</span>
    </button>
  );
}