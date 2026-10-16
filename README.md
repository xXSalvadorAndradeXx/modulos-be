# Wood·Stone — Proyecto integrable con pnpm

## Requisitos
Node.js 22+, pnpm 10, PostgreSQL 15+.

```powershell
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install
Copy-Item .env.example .env
# Cree una base PostgreSQL llamada woodstone y configure DATABASE_URL en .env
# Configure ADMIN_API_KEY con 32+ caracteres impredecibles
pnpm db:init
pnpm check
pnpm test
pnpm dev
```

Abra http://localhost:3000. Catálogo: `/productos.html`; seguimiento: `/seguimiento.html`.

## Flujo
1. El cliente selecciona productos y medidas, completa sus datos y genera una cotización en PostgreSQL; el servidor recalcula todo.
2. La cotización entra en `PENDIENTE_REVISION`. Se consulta y descarga PDF con el token del navegador.
3. Un administrador aprueba la cotización con `POST /api/admin/quotes/:id/approve` y header `x-admin-key` (la clave no se expone al navegador).
4. El cliente actualiza seguimiento, convierte la cotización aprobada a pedido, completa su entrega y simula un pago **exclusivamente de prueba**.
5. Se consulta el historial de estados. La creación de facturas administrativas requiere clave; queda `BORRADOR` sin DTE fiscal autorizado.

## Seguridad y límites de producción
- El token de acceso a cotizaciones es un secreto: está en localStorage por simplicidad del prototipo. Para producción migrar a autenticación con sesiones HttpOnly y CSRF.
- Los pagos sandbox no capturan tarjetas, no cobran dinero y se desactivan cuando `NODE_ENV=production`.
- **No hay integración de pagos reales, webhooks verificados, servicio de firma/transmisión a MH ni DTE válidos autorizados.** El esquema adjunto se conserva en `backend/validators/factura.schema.json` pero **no se afirma su vigencia oficial**. Las rutas para JSON fiscal y PDF autorizado rechazan entregas inexistentes.
- Antes de producción se requiere integrar proveedor de pagos y API MH, validación Ajv del esquema oficial vigente, correlativos fiscales, pruebas de aceptación, HTTPS, autenticación administrativa robusta, cifrado de datos, rate limiting, backups, protección contra abuso y controles tributarios.
- Las fotografías, datos de contacto y precios de catálogo son demostrativos hasta que la empresa los confirme.
- Las cotizaciones y pedidos guardan precios históricos; los importes son calculados en backend. La aprobación administrativa es necesaria para vender productos a medida.

## Endpoints
Productos: `GET /api/products`, `GET /api/products/:id`.
Cotizaciones: `POST /api/quotes`, `GET /api/quotes/:id`, `GET /api/quotes/:id/pdf`, `POST /api/quotes/:id/submit`, `POST /api/quotes/:id/checkout`.
Administración: `GET /api/admin/quotes`, `POST /api/admin/quotes/:id/approve`.
Pedidos: `GET /api/orders/:id`, `POST /api/orders/:id/confirm-details`, `GET /api/orders/:id/status`.
Pagos: `POST /api/payments/initiate`, `POST /api/payments/:id/sandbox-confirm`, `GET /api/payments/:id/status`, `POST /api/payments/webhook` (501 hasta integración).
Factura: `POST /api/invoices/generate` (borrador), `GET /api/invoices/:id`, `/json`, `/pdf`, `/status` (JSON y PDF autorizados no se fabrican).

El header `x-access-token` es obligatorio para endpoints de recursos del cliente y `Idempotency-Key` para pagos. La clave `x-admin-key` solo se utiliza en herramientas administrativas fuera del frontend público.
