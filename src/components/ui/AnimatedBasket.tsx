'use client';
import Image from 'next/image';

export function AnimatedBasket({ count }: { count: number }) {
    // If count is > 0 show full basket and hide empty slightly, else show empty
    const isFull = count > 0;

    return (
        <div className="relative w-[30px] h-[30px] group-hover:scale-110 transition-transform duration-300">
            {/* Cesta Vacía */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${isFull ? 'opacity-0' : 'opacity-100'}`}>
                <Image 
                    src="/basket-empty.png" 
                    alt="Cesta" 
                    fill 
                    className="object-contain mix-blend-multiply"
                    sizes="30px"
                />
            </div>
            
            {/* Cesta Llena (Aparece suavemente con un rebote de cosecha) */}
            <div 
                className={`absolute inset-0 origin-bottom transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isFull ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-2'
                }`}
            >
                <Image 
                    src="/basket-full.png" 
                    alt="Cesta llena" 
                    fill 
                    className="object-contain mix-blend-multiply"
                    sizes="30px"
                />
            </div>
        </div>
    );
}
