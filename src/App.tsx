import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { isSupabaseConfigured } from './lib/supabase'
import { uploadPdf } from './lib/uploadPdf'

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!pdfFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(pdfFile)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pdfFile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)
    setQrDataUrl(null)
    setPublicUrl(null)

    if (!file) {
      setPdfFile(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF.')
      setPdfFile(null)
      event.target.value = ''
      return
    }

    setPdfFile(file)
  }

  const handleGenerateQr = async () => {
    if (!pdfFile) return

    if (!isSupabaseConfigured) {
      setError(
        'Configura Supabase en un archivo .env para obtener una URL pública. Revisa el README.',
      )
      return
    }

    setIsGenerating(true)
    setError(null)
    setQrDataUrl(null)
    setPublicUrl(null)

    try {
      const uploadedUrl = await uploadPdf(pdfFile)
      setPublicUrl(uploadedUrl)

      const dataUrl = await QRCode.toDataURL(uploadedUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo generar el código QR.'
      setError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl || !pdfFile) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qr-${pdfFile.name.replace(/\.pdf$/i, '')}.png`
    link.click()
  }

  const handleCopyUrl = async () => {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
  }

  const handleReset = () => {
    setPdfFile(null)
    setPublicUrl(null)
    setQrDataUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Generador de QR para PDF
          </h1>
          <p className="mt-2 text-slate-600">
            Sube un PDF, publícalo en internet y genera un QR que cualquier persona pueda
            escanear.
          </p>
        </header>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Falta configurar Supabase. Copia <code className="font-mono">.env.example</code> a{' '}
            <code className="font-mono">.env</code> y agrega tus credenciales. Sin esto, el QR no
            funcionará en otros dispositivos.
          </div>
        )}

        <main className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">1. Seleccionar PDF</h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                id="pdf-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="pdf-input"
                className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Seleccionar PDF
              </label>

              {pdfFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Limpiar
                </button>
              )}
            </div>

            {pdfFile && (
              <p className="mt-3 text-sm text-slate-600">
                Archivo: <span className="font-medium text-slate-800">{pdfFile.name}</span>
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
          </section>

          {previewUrl && pdfFile && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">2. Vista previa del PDF</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <iframe
                  src={previewUrl}
                  title={`Vista previa de ${pdfFile.name}`}
                  className="h-96 w-full"
                />
              </div>
            </section>
          )}

          {pdfFile && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">3. Publicar y generar QR</h2>
              <p className="mt-2 text-sm text-slate-600">
                El PDF se sube a Supabase Storage y se obtiene una URL pública permanente para
                imprimir el QR.
              </p>
              <button
                type="button"
                onClick={handleGenerateQr}
                disabled={isGenerating}
                className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? 'Subiendo y generando...' : 'Generar QR'}
              </button>
            </section>
          )}

          {publicUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">URL pública del PDF</h2>
              <p className="mt-2 break-all font-mono text-xs text-slate-600">{publicUrl}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Copiar URL
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Abrir PDF
                </a>
              </div>
            </section>
          )}

          {qrDataUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">4. Código QR generado</h2>
              <p className="mt-2 text-sm text-slate-600">
                Imprime este QR. Al escanearlo, cualquier dispositivo abrirá el PDF.
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <img
                  src={qrDataUrl}
                  alt="Código QR del PDF"
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Descargar QR (PNG)
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
