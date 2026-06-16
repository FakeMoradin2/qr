export async function optimizePdf(file: File): Promise<File> {
  if (file.size < 400_000) return file

  try {
    const { PDFDocument } = await import('pdf-lib')
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const optimized = await doc.save({ useObjectStreams: true })

    if (optimized.byteLength < bytes.byteLength) {
      return new File([optimized.slice()], file.name, { type: 'application/pdf' })
    }
  } catch {
    // Si falla la optimización, subir el original
  }

  return file
}

export function isLargePdf(file: File): boolean {
  return file.size > 2 * 1024 * 1024
}
