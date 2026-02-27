import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
        const widthClass = fullWidth ? 'w-full' : '';
        const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary';

        return (
            <div className={`${widthClass} mb-4`}>
                {label && (
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`block ${widthClass} rounded-xl border bg-white px-4 py-3 text-sm text-brand-text shadow-sm focus:ring-1 outline-none transition-all ${errorClass} ${className}`}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
