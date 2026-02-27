import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';

export default async function ConsumerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: orders } = await supabase.from('orders').select('*, producers(brand_name)').eq('consumer_id', user.id).order('created_at', { ascending: false });

    const statusMap: Record<string, string> = {
        pending: 'Pendiente',
        preparing: 'En preparación',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Mi Cuenta</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 border-r border-gray-100 pr-8">
                    <h2 className="text-xl font-bold mb-4">Datos Personales</h2>
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <p className="font-medium text-brand-text mb-1">{profile?.full_name || 'Usuario'}</p>
                            <p className="text-sm text-brand-text/70 mb-1">{user.email}</p>
                            <p className="text-sm text-brand-text/70 mb-4">{profile?.phone || 'Sin teléfono'}</p>
                            <button className="text-brand-primary text-sm font-medium hover:underline">Editar perfil</button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Mis Pedidos</h2>

                    {orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order: any) => (
                                <Card key={order.id}>
                                    <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div>
                                            <p className="text-xs text-brand-text/50 mb-1">
                                                Pedido #{order.id.split('-')[0]} • {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            <h3 className="font-bold text-brand-primary">{order.producers?.brand_name}</h3>
                                            <p className="text-sm font-medium mt-1">{order.total}€</p>
                                        </div>
                                        <div className="mt-4 sm:mt-0 text-right">
                                            <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full font-medium">
                                                {statusMap[order.status as string] || order.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl mb-4">🛍️</span>
                            <p className="text-brand-text/70">Aún no has realizado ningún pedido.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
