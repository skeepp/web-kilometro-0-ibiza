import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-brand-primary text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <Link href="/es" className="text-2xl font-serif font-bold mb-4 block text-brand-background">
                            De la Finca
                        </Link>
                        <p className="text-brand-background/80 max-w-sm">
                            Conectamos productores locales de Mallorca e Ibiza con consumidores que buscan producto real, trazable y de kilómetro cero.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-4 text-brand-background">Plataforma</h4>
                        <ul className="space-y-2">
                            <li><Link href="/es/mercado" className="text-white/80 hover:text-white transition-colors">Mercado</Link></li>
                            <li><Link href="/es/productores" className="text-white/80 hover:text-white transition-colors">Productores</Link></li>
                            <li><Link href="/es/radar" className="text-white/80 hover:text-white transition-colors">Radar de Agricultores</Link></li>
                            <li><Link href="/es/noticias" className="text-white/80 hover:text-white transition-colors">Noticias</Link></li>
                            <li><Link href="/es/nosotros" className="text-white/80 hover:text-white transition-colors">Cómo funciona</Link></li>
                            <li><Link href="/es/productor/dashboard" className="text-white/80 hover:text-white transition-colors">Soy productor</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-4 text-brand-background">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/es/legal/privacidad" className="text-white/80 hover:text-white transition-colors">Privacidad</Link></li>
                            <li><Link href="/es/legal/terminos" className="text-white/80 hover:text-white transition-colors">Términos y condiciones</Link></li>
                            <li><Link href="/es/legal/cookies" className="text-white/80 hover:text-white transition-colors">Política de cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
                    <p>&copy; {new Date().getFullYear()} De la Finca. Todos los derechos reservados.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {/* Social Icons Placeholder */}
                        <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
