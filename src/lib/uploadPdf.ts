import { PDF_BUCKET, supabase } from './supabase'

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadPdf(file: File): Promise<string> {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }

  const filePath = `${Date.now()}-${sanitizeFileName(file.name)}`

  const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(filePath, file, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    throw new Error(`No se pudo subir el PDF: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(filePath)

  if (!data.publicUrl) {
    throw new Error('No se pudo obtener la URL pública del PDF.')
  }

  return data.publicUrl
}
