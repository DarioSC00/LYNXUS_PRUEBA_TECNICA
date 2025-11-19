# 🚀 Despliegue en Render + Vercel

Esta guía te ayudará a desplegar tu aplicación Lynxus:
- **Backend + Base de datos** en **Render**
- **Frontend** en **Vercel**

## 📋 Pre-requisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Cuenta en [Vercel](https://vercel.com) (gratis)
3. Repositorio de GitHub con tu código
4. Código pusheado a GitHub

---

## 🗄️ PARTE 1: Backend en Render

### Paso 1: Push a GitHub
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin Personal
```

### Paso 2: Desplegar con render.yaml (Automático)

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio: `DarioSC00/PruebaTecnicaLynxus`
4. Selecciona la rama **Personal**
5. Render detectará `render.yaml` automáticamente
6. Click en **"Apply"**

Esto creará automáticamente:
- ✅ Base de datos PostgreSQL (`lynxus-db`)
- ✅ Backend API (`lynxus-api`)

### Paso 3: Verificar Backend

Espera 5-10 minutos para que se complete el despliegue.

Visita: `https://lynxus-api.onrender.com/docs`

Deberías ver la documentación Swagger de tu API.

### Paso 4: Copiar URL del Backend

Copia la URL de tu backend (algo como):
```
https://lynxus-api.onrender.com
```

La necesitarás para configurar Vercel.

---

## 🌐 PARTE 2: Frontend en Vercel

### Paso 1: Importar Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub: `DarioSC00/PruebaTecnicaLynxus`
4. Selecciona la rama **Personal**

### Paso 2: Configurar el Proyecto

**Framework Preset:** Vercel detectará automáticamente Next.js

**Root Directory:** `Front/apps/web` ⚠️ **MUY IMPORTANTE**

**Build Settings:**
- Build Command: `pnpm run build` (o déjalo en automático)
- Output Directory: `.next` (automático)
- Install Command: `pnpm install` (automático)

### Paso 3: Variables de Entorno

En la sección **Environment Variables**, agrega:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://lynxus-api.onrender.com` |

⚠️ **Importante:** Reemplaza con la URL real de tu backend de Render del Paso 4 anterior.

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera 3-5 minutos
3. Vercel te dará una URL como: `https://lynxus-web.vercel.app`

### Paso 5: Actualizar CORS en Backend

Ahora que tienes la URL de Vercel, actualiza el backend en Render:

1. Ve a tu servicio `lynxus-api` en Render Dashboard
2. Ve a **"Environment"**
3. Edita la variable `FRONTEND_URL`
4. Cambia el valor a tu URL de Vercel (ej: `https://lynxus-web.vercel.app`)
5. Guarda y espera que se redesplegue (~2 min)

---

## ✅ Verificación Final

### Backend API
Visita: `https://lynxus-api.onrender.com/docs`
✓ Deberías ver Swagger UI

### Frontend
Visita: `https://lynxus-web.vercel.app`
✓ Deberías ver la página de login
✓ Intenta registrarte y hacer login

---

## 🔧 Configuración Adicional

### Dominios Personalizados

**Vercel (Frontend):**
1. Dashboard → Tu proyecto → Settings → Domains
2. Agrega tu dominio personalizado

**Render (Backend):**
1. Dashboard → lynxus-api → Settings → Custom Domain
2. Agrega tu dominio personalizado

### Actualizar URLs después de dominio personalizado

Si cambias de dominio, actualiza las variables de entorno:

**En Vercel:**
- `NEXT_PUBLIC_API_URL` = URL del backend

**En Render:**
- `FRONTEND_URL` = URL del frontend

---

## 🐛 Troubleshooting

### "CORS policy blocked"
- Verifica que `FRONTEND_URL` en Render apunte a tu URL de Vercel
- Asegúrate de incluir `https://` (no `http://`)
- Espera 1-2 minutos después de cambiar variables de entorno

### "Backend no responde"
- Los servicios gratuitos de Render se duermen después de 15 min
- La primera petición puede tardar 30-60 segundos en despertar
- Verifica los logs en Render Dashboard

### "Frontend no conecta con Backend"
- Verifica que `NEXT_PUBLIC_API_URL` en Vercel sea correcta
- Asegúrate de hacer redeploy después de cambiar variables de entorno
- En Vercel Dashboard → Deployments → Click en los 3 puntos → Redeploy

### "Database connection error"
- Verifica que la base de datos en Render esté en estado "Available"
- Revisa los logs del backend en Render
- La base de datos gratuita se borra después de 90 días de inactividad

---

## 🔄 Actualizaciones Automáticas

### Backend (Render)
Cada push a la rama `Personal` desplegará automáticamente:
```bash
git add .
git commit -m "feat: nueva funcionalidad backend"
git push origin Personal
```

### Frontend (Vercel)
Vercel también desplegará automáticamente en cada push:
```bash
git add .
git commit -m "feat: nueva funcionalidad frontend"  
git push origin Personal
```

---

## 💰 Costos

**Render (Plan Free):**
- ✅ 750 horas/mes de backend
- ✅ PostgreSQL (90 días, luego expira si no lo usas)
- ⚠️ El backend se duerme después de 15 min de inactividad

**Vercel (Plan Hobby - Free):**
- ✅ Despliegues ilimitados
- ✅ 100 GB bandwidth/mes
- ✅ Sin límite de tiempo de actividad
- ✅ CDN global automático

**Para producción:**
- Render Starter: $7/mes (backend siempre activo + BD persistente)
- Vercel Pro: $20/mes (más bandwidth y features)

---

## 📊 Monitoreo

**Backend (Render):**
- Logs: Dashboard → lynxus-api → Logs
- Métricas: Dashboard → lynxus-api → Metrics

**Frontend (Vercel):**
- Analytics: Dashboard → Tu proyecto → Analytics
- Logs: Dashboard → Tu proyecto → Deployments → View Function Logs

---

## 🎉 ¡Listo!

Tu aplicación Lynxus está desplegada:

**URLs de ejemplo:**
- Frontend: `https://lynxus-web.vercel.app`
- Backend API: `https://lynxus-api.onrender.com`
- API Docs: `https://lynxus-api.onrender.com/docs`

Comparte tu URL y comienza a usar tu aplicación! 🚀
