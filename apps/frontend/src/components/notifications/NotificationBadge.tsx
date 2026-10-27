"use client";

import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/notificationsApi';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('findora_token');
        if (!token) return;
        const data = await getUnreadCount();
        if (isMounted) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // Silent catch for background unread count fetch
      }
    };

    fetchCount();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (unreadCount <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-blue-600 rounded-full min-w-[18px] h-[18px]">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
