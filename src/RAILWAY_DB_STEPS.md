Guía rápida: desplegar SOLO la base de datos Postgres en Railway

Resumen
---
Si tu deploy falló porque Railpack intentó construir la app completa, no hace falta desplegar el repo entero si solo quieres la base de datos. Railway permite crear un proyecto "Start from scratch" y agregar un plugin Postgres sin conectar el repo.

Pasos (UI) — El flujo recomendado
---
1) Entrar en Railway: https://railway.app
2) Dashboard → New Project → "Start from scratch"
   - No conectes el repositorio aquí si no quieres que Railway intente buildear el repo.
3) Dentro del nuevo proyecto: click "Add Plugin"
4) Selecciona "Postgres" y confirma
   - Selecciona región (ej. US West / us-west2) si te lo pide
   - Espera 1–2 minutos a que se aprovisione
5) En el plugin Postgres, ve a "Variables" / "Settings" y copia `DATABASE_URL`
   - Formato: postgresql://user:password@host:port/dbname
   - Si vas a desplegar el backend en el mismo proyecto, usa esta `DATABASE_URL` (internal) para mayor seguridad

Qué hacer si ya hay un despliegue fallido
---
- Ve al proyecto donde apareció el fallo → Deployments
- Selecciona el despliegue fallido y en los detalles busca la opción para eliminar el servicio (Delete/Remove Service)
- Alternativa: en el panel principal, debajo de Services, localiza el servicio creado automáticamente y elimínalo

Notas técnicas y buenas prácticas
---
- "Start from scratch" + "Add Plugin" evita que Railpack intente detectar lenguaje o buscar `start.sh`.
- Si más tarde quieres que Railway despliegue tu backend desde Git, crea un nuevo Service dentro del mismo proyecto y configura el Dockerfile (`BD/Dockerfile`) y las env vars.

Backup / Export (opcional)
---
Si el DB anterior tiene datos y quieres exportarlos antes de borrar:

PowerShell (requiere `pg_dump` instalado):
```powershell
pg_dump "postgresql://user:password@host:5432/dbname" -Fc -f lynxus_backup.dump
```
Restaurar localmente con `pg_restore`:
```powershell
pg_restore -d postgres "lynxus_backup.dump"
```

Conectar tu backend más tarde
---
- Cuando tengas la `DATABASE_URL`, ve a Render/Railway/otro proveedor donde despliegues el backend y añade la variable de entorno `DATABASE_URL` con ese valor.
- Asegúrate de usar la `Internal` URL si el backend estará en Railway (comunicación interna privada).

Si quieres, puedo:
- borrar las instrucciones en `RAILWAY_DB_STEPS.md` (no necesario);
- ayudarte a eliminar el despliegue fallido paso a paso (indígame cuando estés en la UI);
- o continuar y crear el Service `lynxus-api` en Railway (si me das la autorización para guiarte paso a paso por la UI).

Fin de la guía.
