import { getRequestConfig } from 'next-intl/server';
import esMessages from '../messages/es.json';

export const locales = ['es'];

export default getRequestConfig(async ({ locale }) => {
    return {
        locale: locale || 'es',
        messages: esMessages
    };
});
