"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTasks } from "@/lib/hooks/useTasks";
import { notificationScheduler } from "@/lib/notifications/scheduler";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/OfflineBanner";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showNewTask, setShowNewTask] = useState(false);

  const {
    todayTasks,
    pendingTasks,
    doneTasks,
    loading,
    createTask,
    editTask,
    completeTask,
    postponeTask,
    removeTask,
  } = useTasks(user?.uid || null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    notificationScheduler.requestPermission();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Bonjour"
      : now.getHours() < 18
      ? "Bon apres-midi"
      : "Bonsoir";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <OfflineBanner />

      <main
        style={{
          marginLeft: "260px",
          width: "calc(100% - 260px)",
          padding: "2rem",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* En-tete */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">
              {greeting}, {user.displayName?.split(" ")[0] || "utilisateur"} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button onClick={() => setShowNewTask(true)} size="md">
            + Nouvelle tache
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center shadow-lg">
            <div className="text-3xl mb-1">📅</div>
            <div className="text-3xl font-black text-white">{todayTasks.length}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Aujourd'hui
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center shadow-lg">
            <div className="text-3xl mb-1">⏳</div>
            <div className="text-3xl font-black text-amber-400">
              {pendingTasks.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              En attente
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center shadow-lg">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-3xl font-black text-emerald-400">
              {doneTasks.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Terminees
            </div>
          </div>
        </div>

        {/* Taches */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📅</span> Taches du jour
            <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full">
              {todayTasks.length}
            </span>
          </h2>
          <TaskList
            tasks={todayTasks}
            onComplete={completeTask}
            onReschedule={postponeTask}
            onDelete={removeTask}
            onEdit={editTask}
            emptyMessage="Aucune tache prevue aujourd'hui. Profitez de votre journee !"
          />
        </div>

        {/* Modal nouvelle tache */}
        <Modal
          isOpen={showNewTask}
          onClose={() => setShowNewTask(false)}
          title="Ajouter une nouvelle tache"
        >
          <TaskForm
            onSubmit={async (data) => {
              await createTask(data);
              setShowNewTask(false);
            }}
            onCancel={() => setShowNewTask(false)}
          />
        </Modal>
      </main>
    </div>
  );
}