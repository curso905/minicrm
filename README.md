# Mini CRM

CRM mínimo: backend Node.js + frontend JavaScript con Tailwind. Base de datos en MongoDB Atlas.

## Requisitos

- Node.js 20+
- Cuenta MongoDB Atlas y URI de conexión

## Backend

```bash
cd backend
cp .env.example .env
# Editar .env y poner tu MONGODB_URI de Atlas
npm install
npm run dev
```

API en `http://localhost:4000`. Rutas: `GET/POST /api/contacts`, `GET/PATCH/DELETE /api/contacts/:id`, `POST /api/mail/send` (correo vía Resend).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3000`. El proxy de Vite envía `/api` al backend en el puerto 4000.

### Producción (ej. Render)

- **Frontend (build estático):** al hacer `npm run build`, Vite incrusta `VITE_API_URL`. Debe ser la URL **del servicio API**, no la del sitio estático.
  - Ejemplo: si el front está en `https://minicrm-1ea8.onrender.com` y el API en otro servicio, en el **build del front** usa:
    - `VITE_API_URL=https://<tu-servicio-backend>.onrender.com/api`
  - En Render: Variables de entorno del **Static Site** → `VITE_API_URL` = URL pública del **Web Service** del backend + `/api`.
- **Stripe:** en el backend, `STRIPE_SECRET_KEY` y `STRIPE_PRICE_BASICO=price_...` (Price ID del plan; nunca `prod_...`).

## Variables de entorno (backend)

| Variable     | Descripción                    |
| ------------ | ------------------------------ |
| `PORT`       | Puerto del servidor (default 4000) |
| `MONGODB_URI`| URL de MongoDB Atlas          |
| `RESEND_API_KEY` | API key de [Resend](https://resend.com) (SMTP con Nodemailer) |
| `MAIL_FROM`  | Remitente verificado, ej. `MiniCRM <onboarding@tudominio.com>` |
| `STRIPE_SECRET_KEY` | Clave secreta Stripe (`sk_test_...` / `sk_live_...`) |
| `STRIPE_PRICE_BASICO` | Price ID `price_...` del plan Básico (Checkout) |
| `STRIPE_WEBHOOK_SECRET` | Opcional; firma de webhooks |

## Estructura

```
backend/     → Express, Mongoose, API REST
frontend/    → Vite, Tailwind CSS, JS módulos
```
