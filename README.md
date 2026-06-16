# Generador de QR para PDF

Aplicación web para subir un PDF, publicarlo con una URL pública y generar un código QR imprimible que cualquier persona pueda escanear desde su teléfono.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- [qrcode](https://www.npmjs.com/package/qrcode)
- [Supabase Storage](https://supabase.com/docs/guides/storage) (almacenamiento público del PDF)

## Requisitos

- Node.js 18 o superior
- npm
- Cuenta gratuita en [Supabase](https://supabase.com)

## Instalación

```bash
npm install
```

## Configurar Supabase (obligatorio para QR en otros dispositivos)

Para que el QR funcione al imprimirlo y escanearlo desde cualquier teléfono, el PDF debe estar en una **URL pública en internet**. Usamos Supabase Storage para eso, sin escribir un backend propio.

### 1. Crear proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto gratuito.
2. Ve a **Project Settings → API**.
3. Copia la **Project URL** y la **anon public key**.

### 2. Crear bucket público

1. Ve a **Storage** en el panel de Supabase.
2. Crea un bucket llamado `pdfs`.
3. Marca el bucket como **Public**.

### 3. Políticas de acceso

En **Storage → Policies** del bucket `pdfs`, agrega estas políticas:

**Lectura pública (SELECT):**

```sql
create policy "Public read pdfs"
on storage.objects for select
to public
using ( bucket_id = 'pdfs' );
```

**Subida desde la app (INSERT):**

```sql
create policy "Allow uploads to pdfs"
on storage.objects for insert
to anon
with check ( bucket_id = 'pdfs' );
```

### 4. Variables de entorno

Copia el archivo de ejemplo y completa tus credenciales:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Reinicia el servidor de desarrollo después de crear o cambiar `.env`.

## Ejecución en desarrollo

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

Si despliegas la app (Vercel, Netlify, etc.), configura las mismas variables `VITE_SUPABASE_*` en el panel de tu hosting.

## Uso

1. Haz clic en **Seleccionar PDF** y elige un archivo `.pdf`.
2. Revisa la vista previa local.
3. Pulsa **Generar QR**: el PDF se sube a Supabase y se crea la URL pública.
4. Verifica la URL pública (puedes abrirla o copiarla).
5. Descarga el QR en PNG e imprímelo.

## ¿Por qué Supabase?

Un QR solo funciona en otros dispositivos si apunta a una URL accesible desde internet. Sin servidor, el navegador solo puede crear URLs temporales (`blob:`) que no sirven al imprimir.

Supabase Storage ofrece:

- URL pública HTTPS permanente
- Plan gratuito suficiente para PDFs
- Sin backend propio que mantener

## Límites del plan gratuito

Supabase incluye 1 GB de almacenamiento en el plan free. Para PDFs de eventos o folletos suele ser más que suficiente. Revisa los [límites actuales](https://supabase.com/pricing) en su web.
