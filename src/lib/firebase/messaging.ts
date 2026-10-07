import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import app from "./config";

export const requestNotificationToken = async (): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error("[FCM] Erreur token:", error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  isSupported().then((supported) => {
    if (!supported) return;
    const messaging = getMessaging(app);
    onMessage(messaging, callback);
  });
};
