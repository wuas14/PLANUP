"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTasks } from "@/lib/hooks/useTasks";
import Calendar from "@/components/calendar/Calendar";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";
import OfflineBanner from "@/components/OfflineBanner";

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showNewTask, setShowNewTask] = useState(false);

  const {
    tasks,
    loading,
    createTask,
    editTask,
    completeTask,
    postponeTask,
    removeTask,
  } = useTasks(user?.uid || null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const selectedDateTasks = selectedDate
    ? tasks.filter((t) => {
        const d = t.startTime.toDate();
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

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
          <h1 className="text-3xl font-black">Calendrier et Planning</h1>
          <Button onClick={() => setShowNewTask(true)}>+ Nouvelle tache</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3 text-slate-200">
              {selectedDate
                ? selectedDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Selectionnez un jour"}
            </h2>

            <TaskList
              tasks={selectedDateTasks}
              onComplete={completeTask}
              onReschedule={postponeTask}
              onDelete={removeTask}
              onEdit={editTask}
              emptyMessage="Aucune tache prevue pour cette journee."
            />
          </div>
        </div>

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