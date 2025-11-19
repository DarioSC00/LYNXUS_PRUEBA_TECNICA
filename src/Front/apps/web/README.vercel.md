# Vercel Deployment Configuration for Next.js Frontend

Este proyecto está configurado para desplegarse en Vercel.

## Configuración Requerida

### Root Directory
Asegúrate de configurar el **Root Directory** en Vercel como:
```
Front/apps/web
```

### Variables de Entorno
Agrega esta variable de entorno en tu proyecto de Vercel:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://lynxus-api.onrender.com` | URL del backend en Render |

⚠️ **Importante:** Reemplaza con la URL real de tu backend después de desplegarlo en Render.

## Comandos de Build

Vercel detectará automáticamente Next.js y usará:
- **Build Command:** `pnpm run build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

## Despliegue

1. Conecta tu repositorio de GitHub a Vercel
2. Configura el Root Directory como `Front/apps/web`
3. Agrega la variable de entorno `NEXT_PUBLIC_API_URL`
4. Click en "Deploy"

Para más detalles, consulta `DEPLOYMENT.md` en la raíz del proyecto.
