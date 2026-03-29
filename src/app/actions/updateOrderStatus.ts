'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/lib/constants';
import { stripe } from '@/utils/stripe/server';
import { sendReadyForPickupConsumer } from '@/utils/resend/emails';

function getSupabaseAdmin() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'No autenticado.' };
    }

    // Verify the caller is either the producer who owns this order or an admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    let canUpdate = false;

    if (profile?.role === 'admin') {
        canUpdate = true;
    } else if (profile?.role === 'producer') {
        // Ensure this producer owns the order
        const { data: order } = await supabase
            .from('orders')
            .select('producer_id, producers!inner(user_id)')
            .eq('id', orderId)
            .single();

        if (order) {
            const producers = order.producers as unknown as { user_id: string } | { user_id: string }[];
            const producerData = Array.isArray(producers) ? producers[0] : producers;
            canUpdate = producerData?.user_id === user.id;
        }
    }

    if (!canUpdate) {
        return { success: false, error: 'No autorizado para actualizar este pedido.' };
    }

    // Update the order status
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        return { success: false, error: error.message };
    }

    // === SIDE EFFECTS BASED ON STATUS ===
    const adminSupabase = getSupabaseAdmin();

    if (status === 'ready_pickup') {
        // Fetch order details for notifications and transfer
        const { data: order } = await adminSupabase
            .from('orders')
            .select('*, producers(brand_name, stripe_account_id, user_id, pickup_address)')
            .eq('id', orderId)
            .single();

        if (order) {
            const producer = order.producers as unknown as {
                brand_name: string;
                stripe_account_id: string;
                user_id: string;
                pickup_address: string;
            };

            // 1. Send "Ready for Pickup" email to consumer
            try {
                const { data: authUser } = await adminSupabase.auth.admin.getUserById(order.consumer_id);
                if (authUser?.user?.email) {
                    await sendReadyForPickupConsumer(
                        authUser.user.email,
                        orderId,
                        producer.brand_name,
                        order.delivery_address || producer.pickup_address || '',
                        order.pickup_code || ''
                    );
                    console.log(`📧 Ready-for-pickup email sent for order ${orderId}`);
                }
            } catch (emailErr) {
                console.error('⚠️ Failed to send ready-for-pickup email:', emailErr);
            }

            // 2. Execute Stripe Transfer to the producer (DEFERRED transfer)
            if (producer.stripe_account_id && order.stripe_payment_intent_id) {
                try {
                    const { data: pi } = await adminSupabase
                        .from('orders')
                        .select('stripe_payment_intent_id, subtotal')
                        .eq('id', orderId)
                        .single();

                    if (pi) {
                        // Get the transfer_group from the PaymentIntent
                        const paymentIntent = await stripe.paymentIntents.retrieve(pi.stripe_payment_intent_id);

                        await stripe.transfers.create({
                            amount: Math.round(Number(pi.subtotal) * 100), // Transfer net amount to producer
                            currency: 'eur',
                            destination: producer.stripe_account_id,
                            transfer_group: paymentIntent.transfer_group || undefined,
                            metadata: {
                                orderId: orderId,
                                trigger: 'ready_pickup',
                            }
                        });
                        console.log(`💸 Transfer of ${pi.subtotal}€ to ${producer.stripe_account_id} for order ${orderId}`);
                    }
                } catch (transferErr) {
                    console.error(`❌ Failed to transfer funds for order ${orderId}:`, transferErr);
                    // Don't fail the status update if transfer fails
                }
            }
        }
    }

    revalidatePath('/es/productor/pedidos');
    revalidatePath('/es/admin/pedidos');
    revalidatePath('/es/cuenta');
    return { success: true };
}
