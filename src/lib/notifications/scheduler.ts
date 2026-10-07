import { Task } from "@/lib/firebase/firestore";

class NotificationScheduler {
  private scheduledNotifs: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("[Notif] API non supportee");
      return false;
    }

    if (Notification.permission === "granted") return true;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  schedule(task: Task): void {
    if (!task.id) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const startMs = task.startTime.toDate().getTime();
    const notifyMs = startMs - task.notifyBefore * 60 * 1000;
    const delay = notifyMs - Date.now();

    this.cancel(task.id);

    if (delay <= 0) return;

    const timeoutId = setTimeout(() => {
      this.show(task);
    }, delay);

    this.scheduledNotifs.set(task.id, timeoutId);
  }

  private show(task: Task): void {
    const notif = new Notification(`Rappel: ${task.title}`, {
      body: `Commence dans ${task.notifyBefore} minute(s)`,
      icon: "/icons/icon-192x192.png",
      tag: task.id,
    });

    notif.onclick = () => {
      window.focus();
      window.location.href = `/dashboard?task=${task.id}`;
      notif.close();
    };
  }

  cancel(taskId: string): void {
    const existing = this.scheduledNotifs.get(taskId);
    if (existing) {
      clearTimeout(existing);
      this.scheduledNotifs.delete(taskId);
    }
  }

  cancelAll(): void {
    this.scheduledNotifs.forEach((timeout) => clearTimeout(timeout));
    this.scheduledNotifs.clear();
  }

  rescheduleAll(tasks: Task[]): void {
    this.cancelAll();
    tasks
      .filter((t) => t.status === "pending")
      .forEach((t) => this.schedule(t));
  }
}

export const notificationScheduler = new NotificationScheduler();