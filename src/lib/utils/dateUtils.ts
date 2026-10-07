import { Timestamp } from "firebase/firestore";

export const formatTime = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatShortDate = (timestamp: Timestamp): string => {
  return timestamp.toDate().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const isToday = (timestamp: Timestamp): boolean => {
  const date = timestamp.toDate();
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isPast = (timestamp: Timestamp): boolean => {
  return timestamp.toDate() < new Date();
};

export const toTimestamp = (
  dateStr: string,
  timeStr: string
): Timestamp => {
  const date = new Date(`${dateStr}T${timeStr}`);
  return Timestamp.fromDate(date);
};

export const TASK_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Emeraude", value: "#10b981" },
  { label: "Ambre", value: "#f59e0b" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Orange", value: "#f97316" },
];

export const CATEGORIES = [
  "Cours",
  "Revisions",
  "Sport",
  "Personnel",
  "Travail",
  "Autre",
];

export const NOTIFY_OPTIONS = [
  { label: "5 minutes avant", value: 5 },
  { label: "10 minutes avant", value: 10 },
  { label: "15 minutes avant", value: 15 },
  { label: "30 minutes avant", value: 30 },
  { label: "1 heure avant", value: 60 },
];