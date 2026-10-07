"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Task,
  listenToTasks,
  addTask,
  updateTask,
  markTaskAsDone,
  rescheduleTask,
  deleteTask,
} from "@/lib/firebase/firestore";
import { notificationScheduler } from "@/lib/notifications/scheduler";

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToTasks(userId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
      notificationScheduler.rescheduleAll(fetchedTasks);
    });

    return () => unsubscribe();
  }, [userId]);

  const createTask = useCallback(
    async (
      taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      if (!userId) return;
      await addTask({ ...taskData, userId });
    },
    [userId]
  );

  const editTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      await updateTask(taskId, updates);
    },
    []
  );

  const completeTask = useCallback(async (taskId: string) => {
    await markTaskAsDone(taskId);
    notificationScheduler.cancel(taskId);
  }, []);

  const postponeTask = useCallback(
    async (taskId: string, newStart: Date, newEnd: Date) => {
      await rescheduleTask(taskId, newStart, newEnd);
    },
    []
  );

  const removeTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
    notificationScheduler.cancel(taskId);
  }, []);

  const todayTasks = tasks.filter((t) => {
    const taskDate = t.startTime.toDate();
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return {
    tasks,
    todayTasks,
    pendingTasks,
    doneTasks,
    loading,
    createTask,
    editTask,
    completeTask,
    postponeTask,
    removeTask,
  };
}