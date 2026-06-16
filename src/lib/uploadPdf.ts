import { PDF_BUCKET } from './supabase'

const CACHE_MAX_AGE = '31536000' // 1 año — los PDFs no cambian tras subirse

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export type UploadOptions = {
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

export async function uploadPdf(file: File, options: UploadOptions = {}): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Supabase no está configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }

  const filePath = `${Date.now()}-${sanitizeFileName(file.name)}`
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${PDF_BUCKET}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`

  await uploadWithProgress(uploadUrl, file, anonKey, options)

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${PDF_BUCKET}/${filePath}`
  return publicUrl
}

function uploadWithProgress(
  url: string,
  file: File,
  anonKey: string,
  { onProgress, signal }: UploadOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`)
    xhr.setRequestHeader('apikey', anonKey)
    xhr.setRequestHeader('Content-Type', 'application/pdf')
    xhr.setRequestHeader('cache-control', `max-age=${CACHE_MAX_AGE}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('x-content-disposition', 'inline')

    const abortHandler = () => {
      xhr.abort()
      reject(new DOMException('Subida cancelada', 'AbortError'))
    }

    if (signal) {
      if (signal.aborted) {
        reject(new DOMException('Subida cancelada', 'AbortError'))
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    }

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      signal?.removeEventListener('abort', abortHandler)
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      let message = `Error ${xhr.status} al subir el PDF`
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string }
        message = body.message ?? body.error ?? message
      } catch {
        // respuesta no JSON
      }
      reject(new Error(message))
    })

    xhr.addEventListener('error', () => {
      signal?.removeEventListener('abort', abortHandler)
      reject(new Error('Error de red al subir el PDF.'))
    })

    xhr.addEventListener('abort', () => {
      signal?.removeEventListener('abort', abortHandler)
      reject(new DOMException('Subida cancelada', 'AbortError'))
    })

    xhr.send(file)
  })
}
