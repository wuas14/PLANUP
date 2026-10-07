"use client";
import { useState, useEffect } from "react";
import { notificationScheduler } from "@/lib/notifications/scheduler";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationScheduler.requestPermission();
    if (granted) {
      setPermission("granted");
    } else {
      setPermission("denied");
    }
    return granted;
  };

  return {
    permission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    requestPermission,
  };
}