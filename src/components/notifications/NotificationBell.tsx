'use client';

import { useState, useEffect, useRef } from 'react';
import { getUnreadNotificationCount, getUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notificationActions';
import { NotificationCard } from './NotificationCard';

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<unknown[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Initial load & Polling for unread count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const count = await getUnreadNotificationCount();
                setUnreadCount(count);
            } catch {
                // Silent fail for polling
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Load full notifications when opening
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getUserNotifications(15);
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        const optimisticUnread = unreadCount;
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await markAllNotificationsRead();
        } catch {
            setUnreadCount(optimisticUnread);
        }
    };

    const handleMarkRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        try {
            await markNotificationRead(id);
        } catch {
            // silent fail
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 group ${
                    isOpen || unreadCount > 0
                        ? 'bg-brand-accent/10 text-brand-accent'
                        : 'text-brand-text/60 hover:text-brand-primary hover:bg-brand-primary/5'
                }`}
                aria-label="Notificaciones"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute right-0 sm:right-auto sm:-left-32 mt-3 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100/50 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-xs text-brand-primary hover:text-brand-accent font-medium"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto overscroll-contain">
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-gray-400 font-medium">Cargando...</div>
                        ) : notifications.length > 0 ? (
                            <div className="flex flex-col divide-y divide-gray-50">
                                {notifications.map(notification => (
                                    <NotificationCard 
                                        key={notification.id} 
                                        notification={notification} 
                                        onMarkRead={() => {
                                            if (!notification.read) handleMarkRead(notification.id);
                                        }} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-2xl">📭</div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Nada por aquí</p>
                                <p className="text-xs text-gray-500">Aún no tienes notificaciones de promociones.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
