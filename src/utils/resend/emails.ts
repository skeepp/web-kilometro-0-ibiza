import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'De la Finca <pedidos@delafinca.local>'; // Update with verified domain later

export async function sendConsumerWelcomeEmail(email: string, name: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '¡Bienvenido a De la Finca!',
        html: `<p>Hola ${name}, gracias por unirte a De la Finca. Empieza a descubrir producto local real.</p>`,
    });
}

export async function sendOrderConfirmationConsumer(email: string, orderId: string, total: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Confirmación de tu pedido #${orderId.split('-')[0]}`,
        html: `<p>Hemos recibido tu pedido correctamente. El total es de ${total}€.</p>`,
    });
}

export async function sendOrderNotificationProducer(email: string, orderId: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `¡Nuevo pedido recibido! #${orderId.split('-')[0]}`,
        html: `<p>Tienes un nuevo pedido pendiente de preparar. Entra en tu panel para ver los detalles.</p>`,
    });
}

export async function sendOrderShippedConsumer(email: string, orderId: string, producerName: string) {
    return resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Tu pedido de ${producerName} está en camino`,
        html: `<p>El productor ha marcado tu pedido como enviado. Lo recibirás pronto.</p>`,
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
