"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "done" | "rescheduled";
  priority: "low" | "medium" | "high";
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
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

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Calendrier</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Aperçu de vos échéances</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Chargement du calendrier...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400 font-medium text-sm">Aucune tâche enregistrée dans le calendrier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400">📅 {task.dueDate}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    task.status === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {task.status === "done" ? "Terminée" : "En cours"}
                  </span>
                </div>
                <p className="font-semibold text-white text-sm truncate">{task.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}