"use client";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
      setWasOffline(true);
    } else if (wasOffline) {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300 ${
        isOnline
          ? "bg-emerald-600 text-white"
          : "bg-amber-500 text-slate-900"
      }`}
    >
      {isOnline ? (
        <>
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Connexion retablie - Synchronisation en cours...
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
          Mode hors ligne - Vos donnees sont enregistrees localement
        </>
      )}
    </div>
  );
}