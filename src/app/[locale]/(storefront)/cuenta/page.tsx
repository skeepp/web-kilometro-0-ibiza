import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { LogoutButton } from '@/components/profile/LogoutButton';
import { ORDER_STATUSES, getPickupQRUrl, type OrderStatus } from '@/lib/constants';
import Image from 'next/image';

export default async function ConsumerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/es/login');
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: orders } = await supabase
        .from('orders')
        .select('*, producers(brand_name, pickup_address)')
        .eq('consumer_id', user.id)
        .order('created_at', { ascending: false });

    type OrderRow = {
        id: string;
        created_at: string;
        total: string | number;
        status: OrderStatus;
        pickup_code?: string;
        delivery_address?: string;
        producers?: { brand_name: string; pickup_address?: string };
    };

    const getStatusConfig = (status: string) => {
        return ORDER_STATUSES.find(s => s.value === status) || { label: status, icon: '❓', color: 'bg-gray-100 text-gray-800' };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Mi Cuenta</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 border-r border-gray-100 pr-8">
                    <h2 className="text-xl font-bold mb-4">Datos Personales</h2>
                    <Card className="mb-4">
                        <CardContent className="p-6">
                            <ProfileCard
                                fullName={profile?.full_name || ''}
                                email={user.email || ''}
                                phone={profile?.phone || null}
                                avatarUrl={profile?.avatar_url || null}
                            />
                        </CardContent>
                    </Card>
                    <LogoutButton />
                </div>

                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Mis Pedidos</h2>

                    {orders && orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order: OrderRow) => {
                                const statusConfig = getStatusConfig(order.status);
                                const isReady = order.status === 'ready_pickup';

                                return (
                                    <Card key={order.id} className={`overflow-hidden ${isReady ? 'ring-2 ring-green-400 shadow-lg' : ''}`}>
                                        {isReady && (
                                            <div className="bg-green-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
                                                🎉 ¡Listo para recoger!
                                            </div>
                                        )}
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs text-brand-text/50 mb-1">
                                                        Pedido #{order.id.split('-')[0]} · {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                    <h3 className="font-bold text-brand-primary">{order.producers?.brand_name}</h3>
                                                    <p className="text-sm font-medium mt-1">{Number(order.total).toFixed(2)}€</p>

                                                    {/* Pickup address */}
                                                    {(order.delivery_address || order.producers?.pickup_address) && (
                                                        <div className="mt-3 flex items-start gap-2 text-xs text-brand-text/60 bg-brand-background/30 px-3 py-2 rounded-lg">
                                                            <span>📍</span>
                                                            <span>{order.delivery_address || order.producers?.pickup_address}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                                        {statusConfig.icon} {statusConfig.label}
                                                    </span>

                                                    {/* Pickup code with QR */}
                                                    {order.pickup_code && (
                                                        <div className="text-center bg-white border-2 border-brand-primary/20 rounded-xl p-3 shadow-sm">
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Código Recogida</p>
                                                            <p className="font-mono font-bold text-brand-primary tracking-widest text-sm">{order.pickup_code}</p>
                                                            <Image
                                                                src={getPickupQRUrl(order.pickup_code)}
                                                                alt="QR Code"
                                                                width={80}
                                                                height={80}
                                                                className="mt-2 mx-auto"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
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
