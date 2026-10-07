"use client";
import { useState } from "react";
import { Task } from "@/lib/firebase/firestore";
import { formatTime, formatShortDate } from "@/lib/utils/dateUtils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TaskForm from "./TaskForm";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onReschedule: (id: string, start: Date, end: Date) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
}

export default function TaskCard({
  task,
  onComplete,
  onReschedule,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");

  const isDone = task.status === "done";

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) return;
    const start = new Date(`${rescheduleDate}T${rescheduleStart}`);
    const end = new Date(`${rescheduleDate}T${rescheduleEnd}`);
    onReschedule(task.id!, start, end);
    setShowReschedule(false);
  };

  return (
    <>
      <div
        className={`bg-slate-900 rounded-2xl p-4 border border-slate-800 transition-all hover:border-indigo-500/50 ${
          isDone ? "opacity-60" : ""
        }`}
        style={{ borderLeftColor: task.color, borderLeftWidth: "4px" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.color }}
              />
              <h3
                className={`font-semibold truncate ${
                  isDone ? "line-through text-slate-400" : "text-white"
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>
                {formatTime(task.startTime)} - {formatTime(task.endTime)}
              </span>
              <span>- {formatShortDate(task.startTime)}</span>
              {task.category && (
                <span className="bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {task.category}
                </span>
              )}
              {task.fromCache && (
                <span className="text-amber-400">Hors ligne</span>
              )}
            </div>

            <div className="mt-2">
              <Badge status={task.status} />
            </div>
          </div>

          {!isDone && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onComplete(task.id!)}
                className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-all"
                title="Marquer comme fait"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <button
                onClick={() => setShowReschedule(true)}
                className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
                title="Reprogrammer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={() => setShowEdit(true)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
                title="Modifier"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={() => onDelete(task.id!)}
                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier la tache">
        <TaskForm
          initialData={task}
          onSubmit={async (data) => {
            await onEdit(task.id!, data);
            setShowEdit(false);
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        title="Reprogrammer la tache"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Choisissez un nouveau creneau pour <strong className="text-white">{task.title}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nouvelle date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Debut</label>
              <input
                type="time"
                value={rescheduleStart}
                onChange={(e) => setRescheduleStart(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Fin</label>
              <input
                type="time"
                value={rescheduleEnd}
                onChange={(e) => setRescheduleEnd(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowReschedule(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleReschedule}>
              Reprogrammer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}