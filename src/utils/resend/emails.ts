import { Resend } from 'resend';
import { getPickupQRUrl } from '@/lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'De la Finca <onboarding@resend.dev>';

export async function sendConsumerWelcomeEmail(email: string, name: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '¡Bienvenido a De la Finca!',
        html: `<p>Hola ${name}, gracias por unirte a De la Finca. Empieza a descubrir producto local real.</p>`,
    });
}

export async function sendOrderConfirmationConsumer(
    email: string,
    orderId: string,
    total: string,
    pickupCode: string,
    pickupAddress: string,
    producerName: string
) {
    const qrUrl = getPickupQRUrl(pickupCode);
    const shortId = orderId.split('-')[0].toUpperCase();

    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `✅ Pedido #${shortId} confirmado — Recogida en ${producerName}`,
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #2d5016; margin: 0;">¡Pedido confirmado!</h1>
                    <p style="color: #666; margin-top: 8px;">Pedido #${shortId} · ${total}€</p>
                </div>

                <div style="background: #f8faf5; border: 1px solid #e0e8d6; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                    <h2 style="color: #2d5016; margin: 0 0 12px 0; font-size: 18px;">📍 Punto de recogida</h2>
                    <p style="margin: 0; font-weight: bold; font-size: 16px;">${producerName}</p>
                    <p style="margin: 4px 0 0 0; color: #555;">${pickupAddress}</p>
                </div>

                <div style="background: #fff; border: 2px solid #2d5016; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                    <p style="color: #888; margin: 0 0 8px 0; font-size: 13px;">Tu código de recogida</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2d5016; margin: 0;">${pickupCode}</p>
                    <img src="${qrUrl}" alt="QR Code" style="margin-top: 16px; width: 150px; height: 150px;" />
                    <p style="color: #999; font-size: 12px; margin-top: 8px;">Muestra este código al productor para recoger tu pedido</p>
                </div>

                <div style="background: #fef9e7; border: 1px solid #f0e6b2; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="margin: 0; color: #8a6d0b; font-size: 14px;">
                        ⏳ Te avisaremos por email cuando tu pedido esté <strong>listo para recoger</strong>.
                    </p>
                </div>
            </div>
        `,
    });
}

export async function sendOrderNotificationProducer(email: string, orderId: string) {
    const shortId = orderId.split('-')[0].toUpperCase();
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `🔔 ¡Nuevo pedido recibido! #${shortId}`,
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2d5016;">Nuevo pedido pagado</h1>
                <p>Tienes un nuevo pedido pendiente de preparar. Entra en tu panel para ver los detalles.</p>
                <div style="background: #f8faf5; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                    <p style="font-size: 24px; font-weight: bold; color: #2d5016; margin: 0;">Pedido #${shortId}</p>
                </div>
                <p style="color: #666;">Cuando tengas el pedido listo, pulsa <strong>"Notificar Recogida"</strong> en tu panel para avisar al cliente.</p>
            </div>
        `,
    });
}

export async function sendReadyForPickupConsumer(
    email: string,
    orderId: string,
    producerName: string,
    pickupAddress: string,
    pickupCode: string
) {
    const qrUrl = getPickupQRUrl(pickupCode);
    const shortId = orderId.split('-')[0].toUpperCase();

    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `🎉 ¡Tu pedido en ${producerName} ya está listo para recoger!`,
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 60px; margin-bottom: 12px;">🎉</div>
                    <h1 style="color: #2d5016; margin: 0;">¡Tu pedido está listo!</h1>
                </div>

                <div style="background: #e8f5e9; border: 2px solid #4caf50; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;">Recoge tu pedido en:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #2d5016; margin: 0;">${producerName}</p>
                    <p style="margin: 4px 0 0 0; color: #555;">${pickupAddress}</p>
                </div>

                <div style="background: #fff; border: 2px solid #2d5016; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                    <p style="color: #888; margin: 0 0 8px 0; font-size: 13px;">Tu código de recogida</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2d5016; margin: 0;">${pickupCode}</p>
                    <img src="${qrUrl}" alt="QR Code" style="margin-top: 16px; width: 150px; height: 150px;" />
                </div>

                <p style="text-align: center; color: #666; font-size: 13px;">Pedido #${shortId}</p>
            </div>
        `,
    });
}

export async function sendProducerWelcomeEmail(email: string, brandName: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '¡Tu cuenta de productor ha sido aprobada!',
        html: `<p>Hola ${brandName}, ya puedes acceder a tu panel y subir tus productos.</p>`,
    });
}
