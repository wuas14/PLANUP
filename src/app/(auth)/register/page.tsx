"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { notificationScheduler } from "@/lib/notifications/scheduler";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      await notificationScheduler.requestPermission();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[Auth Error]", err);
      
      // Traduction des erreurs Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Cette adresse email est deja utilisee.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("L'authentification par email n'est pas activee dans Firebase Console.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format d'email invalide.");
      } else if (err.code === "auth/weak-password") {
        setError("Mot de passe trop faible (6 caracteres minimum).");
      } else if (err.code === "auth/network-request-failed") {
        setError("Probleme de connexion Internet.");
      } else {
        setError(`Erreur: ${err.message || err.code || "Impossible de creer le compte"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-indigo-500">
            Plan<span className="text-white">Up</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Creez votre compte en quelques secondes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-white">Inscription</h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nom@exemple.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="6 caracteres minimum"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              S'inscrire
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Vous avez deja un compte ?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}