export const showLocalNotification = (
  title: string,
  body: string,
  taskId?: string
): void => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notif = new Notification(title, {
    body,
    icon: "/icons/icon-192x192.png",
    tag: taskId,
  });

  notif.onclick = () => {
    window.focus();
    if (taskId) {
      window.location.href = `/dashboard?task=${taskId}`;
    }
    notif.close();
  };
};