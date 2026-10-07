"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTasks } from "@/lib/hooks/useTasks";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/OfflineBanner";

type Filter = "all" | "pending" | "done" | "rescheduled";

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showNewTask, setShowNewTask] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const { tasks, loading, createTask, editTask, completeTask, postponeTask, removeTask } =
    useTasks(user?.uid || null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const filteredTasks = tasks.filter((t) =>
    filter === "all" ? true : t.status === filter
  );

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Toutes", count: tasks.length },
    { key: "pending", label: "En attente", count: tasks.filter((t) => t.status === "pending").length },
    { key: "done", label: "Terminees", count: tasks.filter((t) => t.status === "done").length },
    { key: "rescheduled", label: "Reprogrammees", count: tasks.filter((t) => t.status === "rescheduled").length },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">📋 Toutes vos taches</h1>
          <Button onClick={() => setShowNewTask(true)}>+ Nouvelle tache</Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <TaskList
          tasks={filteredTasks}
          onComplete={completeTask}
          onReschedule={postponeTask}
          onDelete={removeTask}
          onEdit={editTask}
          emptyMessage="Aucune tache ne correspond a ce filtre"
        />

        <Modal
          isOpen={showNewTask}
          onClose={() => setShowNewTask(false)}
          title="Ajouter une tache"
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