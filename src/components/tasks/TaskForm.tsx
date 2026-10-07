"use client";
import { useState } from "react";
import { Task } from "@/lib/firebase/firestore";
import { toTimestamp, TASK_COLORS, CATEGORIES, NOTIFY_OPTIONS } from "@/lib/utils/dateUtils";
import Button from "@/components/ui/Button";

interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Task>;
}

export default function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.startTime
      ? initialData.startTime.toDate().toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    startTime: initialData?.startTime
      ? initialData.startTime.toDate().toTimeString().slice(0, 5)
      : "08:00",
    endTime: initialData?.endTime
      ? initialData.endTime.toDate().toTimeString().slice(0, 5)
      : "09:00",
    color: initialData?.color || "#6366f1",
    category: initialData?.category || "Cours",
    notifyBefore: initialData?.notifyBefore || 15,
    status: initialData?.status || ("pending" as const),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        startTime: toTimestamp(form.date, form.startTime),
        endTime: toTimestamp(form.date, form.endTime),
        color: form.color,
        category: form.category,
        notifyBefore: Number(form.notifyBefore),
        status: form.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Titre *
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ex: Cours d'histoire"
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Details optionnels..."
          rows={2}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Date *
        </label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Debut *
          </label>
          <input
            type="time"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Fin *
          </label>
          <input
            type="time"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Categorie
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Rappel
        </label>
        <select
          value={form.notifyBefore}
          onChange={(e) =>
            setForm({ ...form, notifyBefore: Number(e.target.value) })
          }
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
        >
          {NOTIFY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Couleur
        </label>
        <div className="flex gap-2 flex-wrap">
          {TASK_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setForm({ ...form, color: c.value })}
              className={`w-8 h-8 rounded-full transition-all duration-200 ${
                form.color === c.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.title ? "Modifier" : "Creer"}
        </Button>
      </div>
    </form>
  );
}