import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import { PdfPreview } from './components/PdfPreview'
import { UploadProgress } from './components/UploadProgress'
import { usePdfUpload } from './hooks/usePdfUpload'
import { isLargePdf } from './lib/optimizePdf'
import { isSupabaseConfigured } from './lib/supabase'
import { buildViewerUrl, normalizeLinkUrl } from './lib/viewerUrl'

type GeneratorMode = 'pdf' | 'link'

async function generateQrDataUrl(targetUrl: string): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
}

export function GeneratorApp() {
  const [mode, setMode] = useState<GeneratorMode>('pdf')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { publicUrl, status, progress, error: uploadError, retry } = usePdfUpload(pdfFile)

  const switchMode = (nextMode: GeneratorMode) => {
    if (nextMode === mode) return
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setMode(nextMode)
    setPdfFile(null)
    setPreviewUrl(null)
    setLinkInput('')
    setQrDataUrl(null)
    setViewerUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)
    setQrDataUrl(null)
    setViewerUrl(null)

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

  const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLinkInput(event.target.value)
    setError(null)
    setQrDataUrl(null)
    setViewerUrl(null)
  }

  const handleGeneratePdfQr = async () => {
    if (!pdfFile || !publicUrl) return

    setIsGeneratingQr(true)
    setError(null)

    const qrTargetUrl = buildViewerUrl(publicUrl)
    setViewerUrl(qrTargetUrl)

    try {
      setQrDataUrl(await generateQrDataUrl(qrTargetUrl))
    } catch {
      setError('No se pudo generar el código QR.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleGenerateLinkQr = async () => {
    const normalizedUrl = normalizeLinkUrl(linkInput)
    if (!normalizedUrl) {
      setError('Ingresa un enlace válido (por ejemplo: https://ejemplo.com).')
      return
    }

    setIsGeneratingQr(true)
    setError(null)
    setViewerUrl(normalizedUrl)

    try {
      setQrDataUrl(await generateQrDataUrl(normalizedUrl))
    } catch {
      setError('No se pudo generar el código QR.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl) return

    let filename = 'qr-enlace.png'
    if (mode === 'pdf' && pdfFile) {
      filename = `qr-${pdfFile.name.replace(/\.pdf$/i, '')}.png`
    } else if (viewerUrl) {
      try {
        const { hostname } = new URL(viewerUrl)
        filename = `qr-${hostname}.png`
      } catch {
        filename = 'qr-enlace.png'
      }
    }

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = filename
    link.click()
  }

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
  }

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPdfFile(null)
    setPreviewUrl(null)
    setLinkInput('')
    setQrDataUrl(null)
    setViewerUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayError = error ?? (mode === 'pdf' ? uploadError : null)
  const isUploading = status === 'uploading'
  const isPdfReady = status === 'ready' && Boolean(publicUrl)
  const isLinkReady = normalizeLinkUrl(linkInput) !== null
  const fileSizeMb = pdfFile ? (pdfFile.size / (1024 * 1024)).toFixed(2) : null
  const showSizeWarning = pdfFile ? isLargePdf(pdfFile) : false

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generador de QR</h1>
          <p className="mt-2 text-slate-600">
            Crea un QR desde un enlace o sube un PDF con visor optimizado para móviles.
          </p>
        </header>

        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => switchMode('link')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === 'link'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Enlace
            </button>
            <button
              type="button"
              onClick={() => switchMode('pdf')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === 'pdf'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              PDF
            </button>
          </div>
        </div>

        {!isSupabaseConfigured && mode === 'pdf' && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Falta configurar Supabase. Agrega <code className="font-mono">VITE_SUPABASE_URL</code>{' '}
            y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> en tu archivo{' '}
            <code className="font-mono">.env</code>.
          </div>
        )}

        <main className="space-y-6">
          {mode === 'link' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">1. Pegar enlace</h2>
              <p className="mt-2 text-sm text-slate-600">
                El QR abrirá directamente la página que indiques al escanearlo.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="url"
                  value={linkInput}
                  onChange={handleLinkChange}
                  placeholder="https://ejemplo.com/pagina"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                {linkInput && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {displayError && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {displayError}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerateLinkQr}
                disabled={!isLinkReady || isGeneratingQr}
                className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingQr ? 'Generando QR...' : 'Generar QR'}
              </button>
            </section>
          ) : (
            <>
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

                {showSizeWarning && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    PDF grande: en móvil puede tardar más. Comprime el archivo antes de subirlo si
                    supera 2 MB (usa ilovepdf.com o similar).
                  </p>
                )}

                {pdfFile && isSupabaseConfigured && (
                  <UploadProgress
                    progress={progress}
                    status={status === 'error' ? 'error' : isPdfReady ? 'ready' : 'uploading'}
                  />
                )}

                {status === 'error' && uploadError && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      {uploadError}
                    </p>
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
                    El QR abre un visor optimizado para móvil con carga progresiva, en lugar del PDF
                    directo.
                  </p>
                  <button
                    type="button"
                    onClick={handleGeneratePdfQr}
                    disabled={!isPdfReady || isGeneratingQr || isUploading}
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
                  <h2 className="text-lg font-semibold text-slate-800">URL directa del PDF</h2>
                  <p className="mt-2 break-all font-mono text-xs text-slate-600">{publicUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(publicUrl)}
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
            </>
          )}

          {viewerUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">
                {mode === 'link' ? 'URL del enlace (QR)' : 'URL del visor (QR)'}
              </h2>
              <p className="mt-2 break-all font-mono text-xs text-slate-600">{viewerUrl}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(viewerUrl)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Copiar URL del QR
                </button>
                <a
                  href={viewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Probar en móvil
                </a>
              </div>
            </section>
          )}

          {qrDataUrl && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">
                {mode === 'link' ? '2. Código QR generado' : '4. Código QR generado'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {mode === 'link'
                  ? 'Imprime este QR. Al escanearlo se abrirá el enlace indicado.'
                  : 'Imprime este QR. Al escanearlo se abre el visor móvil con la primera página al instante.'}
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <img
                  src={qrDataUrl}
                  alt="Código QR generado"
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
