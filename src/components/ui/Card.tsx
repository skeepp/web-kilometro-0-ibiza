import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-soft overflow-hidden border border-brand-primary/5 transition-shadow hover:shadow-lg ${className}`} {...props}>
            {children}
        </div>
    );
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardSectionProps) {
    return (
        <div className={`px-6 py-4 border-b border-brand-primary/5 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '', ...props }: CardSectionProps) {
    return (
        <div className={`px-6 py-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }: CardSectionProps) {
    return (
        <div className={`px-6 py-4 border-t border-brand-primary/5 ${className}`} {...props}>
            {children}
        </div>
    );
}
