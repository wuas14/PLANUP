import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export type TaskStatus = "pending" | "done" | "rescheduled";

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: TaskStatus;
  notifyBefore: number;
  color: string;
  category?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fromCache?: boolean;
}

const TASKS_COLLECTION = "tasks";

export const addTask = async (
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

export const markTaskAsDone = async (taskId: string): Promise<void> => {
  await updateTask(taskId, { status: "done" });
};

export const rescheduleTask = async (
  taskId: string,
  newStart: Date,
  newEnd: Date
): Promise<void> => {
  await updateTask(taskId, {
    status: "rescheduled",
    startTime: Timestamp.fromDate(newStart),
    endTime: Timestamp.fromDate(newEnd),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
};

export const listenToTasks = (
  userId: string,
  callback: (tasks: Task[]) => void
): (() => void) => {
  // Requete simple sans orderBy pour eviter l'obligation d'index composite
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
        fromCache: snapshot.metadata.fromCache,
      }));

      // Tri chronologique direct en JavaScript
      tasks.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

      callback(tasks);
    }
  );
};