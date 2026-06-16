import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfjsWorker

type PdfViewerProps = {
  pdfUrl: string
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [loadProgress, setLoadProgress] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pdfRef = useRef<Awaited<ReturnType<typeof getDocument>['promise']> | null>(null)

  useEffect(() => {
    const origin = new URL(pdfUrl).origin
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = origin
    document.head.appendChild(preconnect)

    return () => {
      document.head.removeChild(preconnect)
    }
  }, [pdfUrl])

  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      setStatus('loading')
      setLoadProgress(0)
      setErrorMessage(null)
      pdfRef.current = null

      try {
        const loadingTask = getDocument({
          url: pdfUrl,
          disableAutoFetch: false,
          disableStream: false,
          rangeChunkSize: 131_072,
        })

        loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
          if (cancelled || progress.total <= 0) return
          setLoadProgress(Math.min(99, Math.round((progress.loaded / progress.total) * 100)))
        }

        const pdf = await loadingTask.promise
        if (cancelled) return

        pdfRef.current = pdf
        setPageCount(pdf.numPages)
        setLoadProgress(100)
        setStatus('ready')
      } catch {
        if (cancelled) return
        setStatus('error')
        setErrorMessage('No se pudo cargar el documento. Intenta abrir el PDF directamente.')
      }
    }

    loadPdf()

    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  useEffect(() => {
    if (status !== 'ready' || !pdfRef.current || !canvasRef.current || !containerRef.current) {
      return
    }

    let cancelled = false

    async function renderPage() {
      const pdf = pdfRef.current
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!pdf || !canvas || !container) return

      const page = await pdf.getPage(pageNum)
      if (cancelled) return

      const baseViewport = page.getViewport({ scale: 1 })
      const containerWidth = container.clientWidth
      const scale = Math.min(containerWidth / baseViewport.width, 2)
      const viewport = page.getViewport({ scale })

      const context = canvas.getContext('2d')
      if (!context) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`

      await page.render({ canvas, canvasContext: context, viewport }).promise
    }

    renderPage()

    return () => {
      cancelled = true
    }
  }, [status, pageNum])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-10 border-b border-slate-700 bg-slate-900/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">Documento PDF</p>
          {status === 'ready' && pageCount > 0 && (
            <p className="shrink-0 text-xs text-slate-400">
              Página {pageNum} de {pageCount}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {status === 'loading' && (
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-400" />
            <p className="font-medium">Abriendo documento...</p>
            <p className="mt-1 text-sm text-slate-400">
              {loadProgress > 0 ? `${loadProgress}% descargado` : 'Conectando...'}
            </p>
            <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.max(loadProgress, 5)}%` }}
              />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-800 bg-red-950/50 p-6 text-center">
            <p className="text-red-200">{errorMessage}</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900"
            >
              Abrir PDF directamente
            </a>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div
              ref={containerRef}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-lg"
            >
              <canvas ref={canvasRef} className="mx-auto block max-w-full" />
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPageNum((n) => Math.max(1, n - 1))}
                  disabled={pageNum <= 1}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPageNum((n) => Math.min(pageCount, n + 1))}
                  disabled={pageNum >= pageCount}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-300 underline underline-offset-2"
              >
                Abrir o descargar PDF completo
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
