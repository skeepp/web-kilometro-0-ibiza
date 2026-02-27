# De la Finca 🌿

Marketplace de comida local Kilómetro 0 para Mallorca e Ibiza. Conecta productores agrícolas locales directamente con consumidores, con envío a domicilio de producto fresco.

## Stack Tecnológico

- **Next.js 14** (App Router, Server Components)
- **Supabase** (Auth, PostgreSQL, RLS)
- **Stripe Connect** (Split payments: productor + comisión plataforma)
- **Tailwind CSS** (Estilos)
- **Cloudinary** (Subida de imágenes)
- **Resend** (Emails transaccionales)
- **next-intl** (Internacionalización)
- **Sentry** (Monitorización de errores)

## Modelo de Negocio

| Concepto | Valor |
|---|---|
| Comisión plataforma | 12% por venta |
| Envío plano (MVP) | 3.90€ |
| Pago | Stripe Connect (split automático) |

## Configuración

### Variables de entorno necesarias

Crea un archivo `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset

# Resend (emails)
RESEND_API_KEY=re_...

# Sentry (opcional)
SENTRY_DSN=...
```

### Instalación

```bash
npm install
npm run dev
```

### Base de datos

La migración SQL está en `supabase/migrations/20260222000000_schema.sql`. Aplícala con:

```bash
npx supabase db push
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (storefront)/     # Tienda pública (landing, productores, carrito, checkout)
│   │   ├── (admin)/          # Panel de administración
│   │   └── (producer)/       # Panel de productor
│   ├── api/                  # API routes (Stripe payment intent)
│   └── actions/              # Server actions
├── components/
│   ├── layout/               # Navbar, Footer, Sidebar, DashboardLayout
│   ├── orders/               # OrderStatusSelect
│   └── ui/                   # Button, Card, Input, DataTable
├── context/                  # CartContext
├── lib/                      # auth.ts, constants.ts
└── utils/                    # Supabase, Stripe, Resend helpers
```

## Funcionalidades

### Consumidor
- Landing con categorías y productores destacados
- Catálogo de productores y productos
- Carrito con restricción a un productor por pedido (MVP)
- Checkout con Stripe

### Productor
- Dashboard con KPIs (pedidos, ingresos, productos)
- Gestión de productos (crear, editar, activar/desactivar)
- Gestión de pedidos recibidos
- Perfil público editable con imágenes (Cloudinary)

### Administrador
- Dashboard global (GMV, comisiones, productores activos)
- Gestión de productores (aprobar, suspender)
- Vista de todos los pedidos
- Panel de comisiones
- Gestión de usuarios
