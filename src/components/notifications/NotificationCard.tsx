'use client';

import Link from 'next/link';
import Image from 'next/image';

function timeAgo(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Ahora';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
}

interface NotificationCardProps {
    notification: {
        id: string;
        type: string;
        title: string;
        body: string;
        image_url?: string;
        action_url?: string;
        created_at: string;
        read: boolean;
    };
    onMarkRead: () => void;
}

export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
    return (
        <div 
            className={`p-4 transition-colors duration-200 border-l-4 ${
                notification.read 
                    ? 'bg-white border-transparent' 
                    : 'bg-brand-primary/5 border-brand-primary'
            } hover:bg-gray-50`}
            onClick={onMarkRead}
        >
            <div className="flex gap-3">
                {notification.image_url && (
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100">
                        <Image 
                            src={notification.image_url} 
                            alt={notification.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold truncate ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                        </h4>
                        {!notification.read && (
                            <span className="w-2 h-2 bg-brand-primary rounded-full mt-1.5 flex-shrink-0"></span>
                        )}
                    </div>
                    <p className={`text-xs mb-2 line-clamp-2 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                        {notification.body}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            {timeAgo(new Date(notification.created_at))}
                        </span>
                        
                        {notification.action_url && (
                            <Link 
                                href={notification.action_url}
                                className="text-[10px] font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
                            >
                                VER DETALLES
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
