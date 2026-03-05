'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-white group-[.toaster]:text-brand-text group-[.toaster]:border-gray-200 group-[.toaster]:shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-2xl font-sans border p-4',
                    description: 'group-[.toast]:text-brand-text/70 text-sm',
                    actionButton:
                        'group-[.toast]:bg-brand-primary group-[.toast]:text-brand-background rounded-lg font-medium',
                    cancelButton:
                        'group-[.toast]:bg-gray-100 group-[.toast]:text-brand-text rounded-lg font-medium',
                    success: 'group-[.toast]:bg-green-50 group-[.toast]:text-green-800 group-[.toast]:border-green-200',
                    error: 'group-[.toast]:bg-red-50 group-[.toast]:text-red-800 group-[.toast]:border-red-200',
                    warning: 'group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-800 group-[.toast]:border-yellow-200',
                    info: 'group-[.toast]:bg-blue-50 group-[.toast]:text-blue-800 group-[.toast]:border-blue-200',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
