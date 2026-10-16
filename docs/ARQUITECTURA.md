# Arquitectura final prevista — Wood·Stone

## Flujo obligatorio

Catálogo → Configuración → Cotización → Revisión/Emisión → PDF cotización → Checkout ligado a cotización vigente → Pedido → Pago por proveedor sandbox/real verificado → Confirmación → DTE validado contra esquema MH → Archivo JSON y PDF → Seguimiento.

**Regla innegociable:** el servidor rechaza checkout sin cotización `EMITIDA` no vencida. No acepta importes del cliente como fuente de verdad.

## Capas

- `frontend/`: HTML5, CSS3, JS vanilla; navegación multipágina y cliente Fetch.
- `backend/routes/`: enrutadores REST Express; autenticación y autorización.
- `backend/controllers/`: HTTP y formatos de respuesta.
- `backend/services/`: reglas de negocio, cálculo e idempotencia.
- `backend/repositories/`: sentencias SQL parametrizadas y transacciones en PostgreSQL.
- `backend/validators/`: Ajv y el JSON Schema proporcionado, sujeto a contraste oficial antes de emitir.
- `backend/storage/`: documentos fuera del directorio web; descargas vía endpoints protegidos.
- `database/`: migraciones SQL, restricciones, claves, índices y semillas verificadas.

## Tablas previstas

`products`, `product_images`, `customers`, `customer_addresses`, `quotes`, `quote_items`, `quote_documents`, `orders`, `order_items`, `payments`, `payment_events`, `invoices`, `invoice_documents`, `order_status_history`, `company_settings`, `audit_logs`.

## Contratos API previstos

- Productos: GET `/api/products`, GET `/api/products/:id`
- Cotizaciones: POST `/api/quotes`, GET `/api/quotes/:id`, GET `/api/quotes/:id/pdf`, POST `/api/quotes/:id/submit`, POST `/api/quotes/:id/checkout`
- Pedidos: GET `/api/orders/:id`, POST `/api/orders/:id/confirm-details`, GET `/api/orders/:id/status`
- Pagos: POST `/api/payments/initiate`, GET `/api/payments/:id/status`, POST `/api/payments/webhook`
- Factura: GET `/api/invoices/:id`, GET `/api/invoices/:id/json`, GET `/api/invoices/:id/pdf`

## Prioridades por fase

1. Preservar y extraer el sitio original, crear servidor y preparar estructura.
2. Catálogo real desde PostgreSQL y fichas detalladas.
3. Cotizaciones, reglas de precio, vencimiento, persistencia y PDF.
4. Checkout mediante cotización emitida y pedidos con snapshots inmutables.
5. Pasarela sandbox claramente marcada, webhooks, idempotencia y protección PCI.
6. DTE 01, Ajv, contraste esquema MH actual, estados tributarios reales.
7. Representación gráfica de factura PDF y archivos privados.
8. Historial del pedido, pruebas de integración, UI móvil y seguridad.

## Notas de seguridad

Nunca servir `backend/storage` con `express.static`. No guardar PAN/CVV. No tomar la redirección web como confirmación de pago. En Fase 1 no existe pago, facturación ni cotizaciones reales.
