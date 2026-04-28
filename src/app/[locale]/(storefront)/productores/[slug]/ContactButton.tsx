'use client';

import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface ContactButtonProps {
    phone?: string | null;
    email?: string | null;
    brandName: string;
}

export function ContactButton({ phone, email, brandName }: ContactButtonProps) {
    const handleContact = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const contactInfo = phone || email || 'info@delafinca.com';
        const isPhone = !!phone;

        // Try to copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(contactInfo);
            toast.success(`¡${isPhone ? 'Teléfono' : 'Email'} copiado al portapapeles!`, {
                description: contactInfo
            });
        }

        // Also try to open the native app
        if (isPhone) {
            window.location.href = `tel:${contactInfo}`;
        } else {
            window.location.href = `mailto:${contactInfo}?subject=Contacto: ${encodeURIComponent(brandName)}`;
        }
    };

    return (
        <Button 
            variant="outline" 
            className="shadow-sm h-9 px-4 text-xs sm:text-sm font-semibold rounded-lg pointer-events-auto"
            onClick={handleContact}
        >
            Contactar
        </Button>
    );
}
