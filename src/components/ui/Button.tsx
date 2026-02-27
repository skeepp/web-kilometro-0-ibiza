import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-background disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-brand-primary text-brand-background hover:bg-brand-accent shadow-soft focus:ring-brand-accent',
        secondary: 'bg-brand-earth text-white hover:bg-brand-earth/90 shadow-soft focus:ring-brand-earth',
        outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-background focus:ring-brand-primary',
        ghost: 'text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
