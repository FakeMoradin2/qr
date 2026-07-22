import type { QrCustomization } from '../lib/qrOptions'

type QrPreviewPanelProps = {
  previewDataUrl: string | null
  customization: QrCustomization
  targetUrl: string | null
  isGenerating: boolean
  isPlaceholder: boolean
  error: string | null
  onDownload: () => void
  onCopyUrl?: (url: string) => void
}

export function QrPreviewPanel({
  previewDataUrl,
  customization,
  targetUrl,
  isGenerating,
  isPlaceholder,
  error,
  onDownload,
  onCopyUrl,
}: QrPreviewPanelProps) {
  const displayUrl = targetUrl ?? null

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {isPlaceholder ? 'Vista previa' : 'Paso 3 · Tu QR'}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              {isPlaceholder ? 'Así quedará tu código' : 'Listo para descargar'}
            </h2>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                isPlaceholder
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isPlaceholder ? 'Esperando contenido' : 'En vivo'}
            </span>
          </div>
        </div>

        <div className="p-5">
          {isPlaceholder && (
            <div className="mb-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              ↑ Añade tu enlace o archivo arriba para activar el QR real.
            </div>
          )}

          <div
            className="relative mx-auto flex aspect-square max-w-[260px] items-center justify-center rounded-2xl border border-slate-200 p-4 shadow-inner"
            style={{ backgroundColor: customization.backgroundColor }}
          >
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Vista previa del código QR"
                className={`max-h-full max-w-full transition-opacity duration-200 ${
                  isGenerating ? 'opacity-60' : 'opacity-100'
                }`}
              />
            ) : (
              <div className="text-center text-sm text-slate-400">
                {error ?? 'Generando…'}
              </div>
            )}

            {isGenerating && previewDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/40">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onDownload}
            disabled={!previewDataUrl || isPlaceholder || isGenerating}
            className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isPlaceholder ? 'Descargar QR (añade contenido primero)' : 'Descargar QR (PNG)'}
          </button>

          {!isPlaceholder && (
            <p className="mt-2 text-center text-xs text-emerald-700">
              Escaneable · {customization.size}px · listo para imprimir
            </p>
          )}

          {displayUrl && (
            <div className="mt-4 space-y-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-slate-500">Destino al escanear</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">{displayUrl}</p>
              </div>
              <div className="flex flex-col gap-2">
                {onCopyUrl && (
                  <button
                    type="button"
                    onClick={() => onCopyUrl(displayUrl)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Copiar URL
                  </button>
                )}
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Probar en móvil
                </a>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
        </div>
      </div>
    </aside>
  )
}
