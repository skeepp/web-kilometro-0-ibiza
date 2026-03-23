/**
 * Platform-wide configuration constants.
 * Single source of truth for business logic values.
 */

/** Platform markup rate (0.10 = 10% added on top of producer net price) */
export const PLATFORM_MARKUP_RATE = 0.10;

/** Utility function to correctly calculate the retail price displayed to customers */
export function getRetailPrice(basePrice: number): number {
  return Number((basePrice * (1 + PLATFORM_MARKUP_RATE)).toFixed(2));
}

/** Flat shipping cost in EUR (MVP) */
export const SHIPPING_FLAT_EUR = 3.90;

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

/** Order statuses */
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value'];
