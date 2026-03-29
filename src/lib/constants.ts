/**
 * Platform-wide configuration constants.
 * Single source of truth for business logic values.
 */

/** Platform markup rate (0.10 = 10% added on top of producer net price) */
export const PLATFORM_MARKUP_RATE = 0.10;

/** Producer payout rate (inverse of markup — producer receives this fraction of retail) */
export const PRODUCER_PAYOUT_RATE = 1 / (1 + PLATFORM_MARKUP_RATE);

/** Utility function to correctly calculate the retail price displayed to customers */
export function getRetailPrice(basePrice: number): number {
  return Number((basePrice * (1 + PLATFORM_MARKUP_RATE)).toFixed(2));
}

/** Currency code */
export const CURRENCY = 'eur';

/** App display name */
export const APP_NAME = 'De la Finca';

/** Product categories */
export const PRODUCT_CATEGORIES = [
  { value: 'fruta', label: 'Fruta', icon: '🍎' },
  { value: 'verdura', label: 'Verdura', icon: '🥬' },
  { value: 'carne', label: 'Carne', icon: '🥩' },
  { value: 'lacteos', label: 'Lácteos', icon: '🧀' },
  { value: 'huevos', label: 'Huevos', icon: '🥚' },
  { value: 'conservas', label: 'Conservas', icon: '🍯' },
] as const;

/** Click & Collect order statuses */
export const ORDER_STATUSES = [
  { value: 'paid', label: 'Pago Confirmado', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'preparing', label: 'En Preparación', icon: '📦', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready_pickup', label: 'Listo para Recoger', icon: '✅', color: 'bg-green-100 text-green-800' },
  { value: 'picked_up', label: 'Recogido', icon: '🤝', color: 'bg-gray-100 text-gray-700' },
  { value: 'cancelled', label: 'Cancelado', icon: '❌', color: 'bg-red-100 text-red-800' },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value'];

/** Generate a random 6-character pickup code */
export function generatePickupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RCG-${code.slice(0, 3)}-${code.slice(3)}`;
}

/** Get QR code URL for a pickup code */
export function getPickupQRUrl(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
}
