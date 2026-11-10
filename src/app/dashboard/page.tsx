"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: "pending" | "done" | "rescheduled";
  priority: "low" | "medium" | "high";
  userId: string;
}

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTasks(fetchedTasks);
          setLoading(false);
        });
        return () => unsubscribeTasks();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const toggleTaskStatus = async (task: Task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      const newStatus = task.status === "done" ? "pending" : "done";
      await updateDoc(taskRef, { status: newStatus });
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "done") return t.status === "done";
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Toutes mes tâches</h1>
          <p className="text-slate-400 text-sm mt-1">Gérez et filtrez votre liste de travail</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl self-start sm:self-auto">
          {(["all", "pending", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Toutes" : f === "pending" ? "En attente" : "Terminées"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Chargement...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400 font-medium">Aucune tâche trouvée pour ce filtre.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  task.status === "done" ? "bg-slate-950/40 border-slate-800/60 opacity-60" : "bg-slate-800/60 border-slate-700/60"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.status === "done" ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 hover:border-indigo-500"
                    }`}
                  >
                    {task.status === "done" && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="overflow-hidden">
                    <p className={`font-semibold text-sm text-white truncate ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">📅 {task.dueDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                    task.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" : task.priority === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {task.priority}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}