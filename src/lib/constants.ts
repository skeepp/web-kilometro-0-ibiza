/**
 * Platform-wide configuration constants.
 * Single source of truth for business logic values.
 */

/** Platform commission rate (0.12 = 12%) */
export const PLATFORM_FEE_RATE = 0.12;

/** Producer payout rate (1 - commission) */
export const PRODUCER_PAYOUT_RATE = 1 - PLATFORM_FEE_RATE;

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
