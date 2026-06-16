import { useState } from 'react'

type PdfPreviewProps = {
  previewUrl: string
  fileName: string
}

export function PdfPreview({ previewUrl, fileName }: PdfPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)

  const iframeSrc = `${previewUrl}#page=1&view=FitH&toolbar=0&navpanes=0`

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">2. Vista previa del PDF</h2>
        {!isVisible && (
          <button
            type="button"
            onClick={() => setIsVisible(true)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Mostrar vista previa
          </button>
        )}
      </div>

      {isVisible ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <iframe
            src={iframeSrc}
            title={`Vista previa de ${fileName}`}
            className="h-96 w-full"
            loading="lazy"
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          La vista previa es opcional y se carga bajo demanda para no ralentizar la subida.
        </p>
      )}
    </section>
  )
}
