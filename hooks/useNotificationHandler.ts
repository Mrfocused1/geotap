import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

type NotificationData = {
  checklistId?: string;
  geofenceId?: string;
};

export function useNotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as NotificationData;
        if (!data.checklistId) return;
        const params = new URLSearchParams();
        if (data.geofenceId) params.set('geofenceId', data.geofenceId);
        params.set('fromNotification', 'true');
        router.push(
          `/checklists/${data.checklistId}?${params.toString()}` as never
        );
      }
    );
    return () => sub.remove();
  }, [router]);
}
