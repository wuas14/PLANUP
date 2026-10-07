"use client";
import { Task } from "@/lib/firebase/firestore";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onReschedule: (id: string, start: Date, end: Date) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  emptyMessage?: string;
}

export default function TaskList({
  tasks,
  onComplete,
  onReschedule,
  onDelete,
  onEdit,
  emptyMessage = "Aucune tache",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onReschedule={onReschedule}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}