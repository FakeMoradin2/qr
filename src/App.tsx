import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import { PdfPreview } from './components/PdfPreview'
import { UploadProgress } from './components/UploadProgress'
import { usePdfUpload } from './hooks/usePdfUpload'
import { isSupabaseConfigured } from './lib/supabase'

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { publicUrl, status, progress, error: uploadError, retry } = usePdfUpload(pdfFile)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)
    setQrDataUrl(null)

    if (!file) {
      setPdfFile(null)
      setPreviewUrl(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF.')
      setPdfFile(null)
      setPreviewUrl(null)
      event.target.value = ''
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPdfFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleGenerateQr = async () => {
    if (!pdfFile || !publicUrl) return

    setIsGeneratingQr(true)
    setError(null)

    try {
      const dataUrl = await QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
      setQrDataUrl(dataUrl)
    } catch {
      setError('No se pudo generar el código QR.')
    } finally {
      setIsGeneratingQr(false)
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPdfFile(null)
    setPreviewUrl(null)
    setQrDataUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayError = error ?? uploadError
  const isUploading = status === 'uploading'
  const isReady = status === 'ready' && Boolean(publicUrl)
  const fileSizeMb = pdfFile ? (pdfFile.size / (1024 * 1024)).toFixed(2) : null

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
            Falta configurar Supabase. Agrega <code className="font-mono">VITE_SUPABASE_URL</code>{' '}
            y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> en tu archivo{' '}
            <code className="font-mono">.env</code>.
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
                Archivo:{' '}
                <span className="font-medium text-slate-800">
                  {pdfFile.name} ({fileSizeMb} MB)
                </span>
              </p>
            )}

            {pdfFile && isSupabaseConfigured && (
              <UploadProgress
                progress={progress}
                status={status === 'error' ? 'error' : isReady ? 'ready' : 'uploading'}
              />
            )}

            {status === 'error' && uploadError && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  Reintentar subida
                </button>
              </div>
            )}

            {displayError && status !== 'error' && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {displayError}
              </p>
            )}
          </section>

          {previewUrl && pdfFile && (
            <PdfPreview previewUrl={previewUrl} fileName={pdfFile.name} />
          )}

          {pdfFile && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">3. Generar código QR</h2>
              <p className="mt-2 text-sm text-slate-600">
                El PDF se sube automáticamente al seleccionarlo. Cuando termine, genera el QR al
                instante.
              </p>
              <button
                type="button"
                onClick={handleGenerateQr}
                disabled={!isReady || isGeneratingQr || isUploading}
                className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading
                  ? `Esperando subida (${progress}%)...`
                  : isGeneratingQr
                    ? 'Generando QR...'
                    : 'Generar QR'}
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
