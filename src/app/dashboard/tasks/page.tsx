"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: "pending" | "done" | "rescheduled";
  priority: "low" | "medium" | "high";
  userId: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", currentUser.uid)
        );
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        status: "pending",
        priority,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      console.error("Erreur de création de tâche:", err);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      const newStatus = task.status === "done" ? "pending" : "done";
      await updateDoc(taskRef, { status: newStatus });
    } catch (err) {
      console.error("Erreur de mise à jour:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (err) {
      console.error("Erreur de suppression:", err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {getGreeting()}, <span className="text-indigo-400">{user?.displayName || "Ami"}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 capitalize">{formattedDate}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvelle tâche</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold">📅</div>
          <div>
            <p className="text-2xl font-black text-white">{todayTasks.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aujourd'hui</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">⏳</div>
          <div>
            <p className="text-2xl font-black text-white">{pendingTasks.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En attente</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">✅</div>
          <div>
            <p className="text-2xl font-black text-white">{doneTasks.length}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terminées</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Tâches du jour
          </h2>
          <Link href="/dashboard/tasks" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Chargement des tâches...</div>
        ) : todayTasks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400 font-medium">Aucune tâche prévue aujourd'hui.</p>
            <p className="text-slate-500 text-sm mt-1">Profitez de votre journée !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
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
                    {task.description && <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Créer une tâche</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Titre</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Réviser l'examen" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description (Optionnel)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails..." rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Échéance</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priorité</label>
                  <select value={priority} onChange={(e: any) => setPriority(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-sm">Annuler</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/30">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}