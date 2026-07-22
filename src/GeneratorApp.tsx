import { useMemo, useRef, useState } from 'react'
import { ContentInputSection } from './components/ContentInputSection'
import { QrCustomizeSection } from './components/QrCustomizeSection'
import { QrPreviewPanel } from './components/QrPreviewPanel'
import { StepIndicator } from './components/StepIndicator'
import { useImageUpload } from './hooks/useImageUpload'
import { useLiveQrPreview } from './hooks/useLiveQrPreview'
import { usePdfUpload } from './hooks/usePdfUpload'
import { isAcceptedImageFile } from './lib/imageFile'
import { isLargePdf } from './lib/optimizePdf'
import { DEFAULT_QR_CUSTOMIZATION, type QrCustomization } from './lib/qrOptions'
import { isSupabaseConfigured } from './lib/supabase'
import { buildImageViewerUrl, buildViewerUrl, normalizeLinkUrl } from './lib/viewerUrl'

type GeneratorMode = 'link' | 'image' | 'pdf'

export function GeneratorApp() {
  const [mode, setMode] = useState<GeneratorMode>('link')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [qrCustomization, setQrCustomization] = useState<QrCustomization>(DEFAULT_QR_CUSTOMIZATION)
  const [error, setError] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const pdfUpload = usePdfUpload(mode === 'pdf' ? pdfFile : null)
  const imageUpload = useImageUpload(mode === 'image' ? imageFile : null)

  const uploadState = mode === 'pdf' ? pdfUpload : mode === 'image' ? imageUpload : null
  const publicUrl = uploadState?.publicUrl ?? null
  const status = uploadState?.status ?? 'idle'
  const progress = uploadState?.progress ?? 0
  const uploadError = uploadState?.error ?? null
  const retry = uploadState?.retry

  const isUploadReady = status === 'ready' && Boolean(publicUrl)

  const qrTargetUrl = useMemo(() => {
    if (mode === 'link') return normalizeLinkUrl(linkInput)
    if (mode === 'image' && isUploadReady && publicUrl) return buildImageViewerUrl(publicUrl)
    if (mode === 'pdf' && isUploadReady && publicUrl) return buildViewerUrl(publicUrl)
    return null
  }, [mode, linkInput, isUploadReady, publicUrl])

  const { previewDataUrl, isGenerating, error: previewError, isPlaceholder } = useLiveQrPreview(
    qrTargetUrl,
    qrCustomization,
  )

  const clearPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const switchMode = (nextMode: GeneratorMode) => {
    if (nextMode === mode) return
    clearPreviewUrl()
    setMode(nextMode)
    setPdfFile(null)
    setImageFile(null)
    setPreviewUrl(null)
    setLinkInput('')
    setError(null)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)

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

    clearPreviewUrl()
    setPdfFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError(null)

    if (!file) {
      setImageFile(null)
      setPreviewUrl(null)
      return
    }

    if (!isAcceptedImageFile(file)) {
      setError('Solo se permiten imágenes JPG, PNG, WebP o GIF.')
      setImageFile(null)
      setPreviewUrl(null)
      event.target.value = ''
      return
    }

    clearPreviewUrl()
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDownloadQr = () => {
    if (!previewDataUrl || isPlaceholder) return

    let filename = 'qr-enlace.png'
    if (mode === 'pdf' && pdfFile) {
      filename = `qr-${pdfFile.name.replace(/\.pdf$/i, '')}.png`
    } else if (mode === 'image' && imageFile) {
      filename = `qr-${imageFile.name.replace(/\.[^.]+$/, '')}.png`
    } else if (qrTargetUrl) {
      try {
        const { hostname } = new URL(qrTargetUrl)
        filename = `qr-${hostname}.png`
      } catch {
        filename = 'qr-enlace.png'
      }
    }

    const link = document.createElement('a')
    link.href = previewDataUrl
    link.download = filename
    link.click()
  }

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
  }

  const handleReset = () => {
    clearPreviewUrl()
    setPdfFile(null)
    setImageFile(null)
    setPreviewUrl(null)
    setLinkInput('')
    setQrCustomization(DEFAULT_QR_CUSTOMIZATION)
    setError(null)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const displayError = error ?? (mode === 'link' ? null : uploadError)
  const isLinkReady = normalizeLinkUrl(linkInput) !== null
  const fileSizeMb =
    mode === 'pdf' && pdfFile
      ? (pdfFile.size / (1024 * 1024)).toFixed(2)
      : mode === 'image' && imageFile
        ? (imageFile.size / (1024 * 1024)).toFixed(2)
        : null
  const showSizeWarning = mode === 'pdf' && pdfFile ? isLargePdf(pdfFile) : false
  const needsSupabase = mode === 'pdf' || mode === 'image'

  const contentReady =
    mode === 'link' ? isLinkReady : mode === 'image' ? isUploadReady : isUploadReady

  const currentStep = contentReady ? 3 : 1

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="mb-6 text-center sm:mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Generador de QR</h1>
          <p className="mt-2 text-slate-600">
            Añade tu contenido, mira el resultado y descarga en segundos.
          </p>
        </header>

        <StepIndicator currentStep={currentStep} contentReady={contentReady} />

        {!isSupabaseConfigured && needsSupabase && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Falta configurar Supabase. Agrega <code className="font-mono">VITE_SUPABASE_URL</code>{' '}
            y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> en tu archivo{' '}
            <code className="font-mono">.env</code>.
          </div>
        )}

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[auto_auto]">
          <div className="lg:col-start-1 lg:row-start-1">
            <ContentInputSection
            mode={mode}
            onModeChange={switchMode}
            linkInput={linkInput}
            onLinkChange={setLinkInput}
            onPdfChange={handlePdfChange}
            onImageChange={handleImageChange}
            onReset={handleReset}
            pdfInputRef={pdfInputRef}
            imageInputRef={imageInputRef}
            pdfFile={pdfFile}
            imageFile={imageFile}
            previewUrl={previewUrl}
            fileSizeMb={fileSizeMb}
            showSizeWarning={showSizeWarning}
            displayError={displayError}
            uploadProgress={progress}
            uploadStatus={status}
            isUploadReady={isUploadReady}
            onRetryUpload={retry}
            />
          </div>

          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <QrPreviewPanel
            previewDataUrl={previewDataUrl}
            customization={qrCustomization}
            targetUrl={qrTargetUrl}
            isGenerating={isGenerating}
            isPlaceholder={isPlaceholder}
            error={previewError}
            onDownload={handleDownloadQr}
            onCopyUrl={handleCopyUrl}
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <QrCustomizeSection value={qrCustomization} onChange={setQrCustomization} />
          </div>
        </main>
      </div>
    </div>
  )
}
