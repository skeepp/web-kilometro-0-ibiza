import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NosotrosPage() {
    const steps = [
        {
            icon: '📍',
            title: 'Elige tu productor',
            description: 'Explora las fincas locales de Ibiza y Formentera. Cada productor muestra su ubicación, productos disponibles y métodos de cultivo.',
        },
        {
            icon: '🛒',
            title: 'Haz tu pedido',
            description: 'Añade los productos que más te gusten a tu carrito. Compra directamente del productor, sin intermediarios ni sobrecostes.',
        },
        {
            icon: '📍',
            title: 'Recoge tu pedido',
            description: 'El productor prepara tu pedido con los productos más frescos. Producto de kilómetro cero garantizado.',
        },
    ];

    const values = [
        {
            icon: '🌱',
            title: 'Producto Real',
            description: 'Trabajamos solo con productores que cultivan de forma sostenible y respetuosa con la tierra.',
        },
        {
            icon: '🤝',
            title: 'Comercio Justo',
            description: 'El productor recibe la mayor parte del precio de venta. Sin intermediarios que se lleven tu dinero.',
        },
        {
            icon: '🏝️',
            title: 'Kilómetro Cero',
            description: 'Todos los productos vienen de fincas locales de Ibiza y Formentera. Frescura y sostenibilidad.',
        },
        {
            icon: '🔍',
            title: 'Trazabilidad Total',
            description: 'Sabes exactamente de qué finca viene cada producto. Transparencia total del campo a tu mesa.',
        },
    ];

    return (
        <div>
            {/* Hero */}
            <section className="bg-brand-primary text-white py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-brand-background">
                        ¿Cómo funciona De la Finca?
                    </h1>
                    <p className="text-xl text-brand-background/80 max-w-2xl mx-auto">
                        Conectamos a los productores locales de las Pitiusas con consumidores que valoran el producto real, fresco y de proximidad.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-20 bg-brand-background">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-serif font-bold text-center text-brand-primary mb-16">
                        3 pasos simples
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center text-4xl mx-auto mb-6">
                                    {step.icon}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                                    {i + 1}
                                </div>
                                <h3 className="text-xl font-bold text-brand-primary mb-3">{step.title}</h3>
                                <p className="text-brand-text/70 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-serif font-bold text-center text-brand-primary mb-4">
                        Nuestros Valores
                    </h2>
                    <p className="text-center text-brand-text/60 mb-16 max-w-2xl mx-auto">
                        No somos un supermercado online. Somos una comunidad que une campo y mesa.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((val, i) => (
                            <div key={i} className="flex gap-5 p-6 rounded-2xl bg-brand-background border border-brand-primary/10">
                                <div className="text-4xl flex-shrink-0">{val.icon}</div>
                                <div>
                                    <h3 className="text-lg font-bold text-brand-primary mb-2">{val.title}</h3>
                                    <p className="text-brand-text/70 text-sm leading-relaxed">{val.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-brand-primary">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-background mb-6">
                        ¿Listo para probar producto real?
                    </h2>
                    <p className="text-brand-background/80 mb-8 text-lg">
                        Descubre los productores de tu zona y haz tu primer pedido.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/es/productores">
                            <Button size="lg" className="bg-brand-background text-brand-primary hover:bg-white">
                                Ver productores
                            </Button>
                        </Link>
                        <Link href="/es/registro">
                            <Button size="lg" variant="outline" className="border-brand-background text-brand-background hover:bg-brand-background/10">
                                Crear una cuenta
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
