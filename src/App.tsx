import { lazy, Suspense } from 'react'
import { GeneratorApp } from './GeneratorApp'
import { getViewerPdfUrl } from './lib/viewerUrl'

const PdfViewer = lazy(() =>
  import('./components/PdfViewer').then((module) => ({ default: module.PdfViewer })),
)

function ViewerFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-indigo-400" />
        <p className="text-sm">Cargando visor...</p>
      </div>
    </div>
  )
}

function App() {
  const pdfUrl = getViewerPdfUrl()

  if (pdfUrl) {
    return (
      <Suspense fallback={<ViewerFallback />}>
        <PdfViewer pdfUrl={pdfUrl} />
      </Suspense>
    )
  }

  return <GeneratorApp />
}

export default App
